"use client"

import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, FileSpreadsheet, FileText, Braces, Menu } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx"
import api from "../../api"

// import logo from '../../assets/images/logo.jpg';
import moment from "moment"
import { io } from "socket.io-client"
import Sidebar from "../../components/sidebar"
import { AuthContext } from "../../context/auth"
import { ListContext } from "../../context/list"
import { PlansContext } from "../../context/plans/plans"
import useWindowDimensions from "../../utiles/getWindowDimensions"
import Select from "react-select"
// import { ThreeDots } from 'react-loader-spinner';
import { Header } from "../../components/header/index.jsx"
import NotificationMsg from "../../components/transformation/NotificationMsg.jsx"
import { useTranslation } from "react-i18next"
import ModernDataTable from "../../components/GridTable/index.jsx"
import "./Home.css"
import { Table } from "@/components/ui/table"

// const IntegrationLogsTable = lazy(() => import("../../components/integrations/IntegrationLogsTable"))
const TransformationHistory = lazy(() => import("../../components/transformation/TransformationHistory"))

// const IntegrationSelect = lazy(() => import("../../components/integrations/IntegrationSelect"))

const Home = () => {
  const newRowForm = useRef({})
  const [editingRowIndex, setEditingRowIndex] = useState(null)
  const [showNewRowModal, setShowNewRowModal] = useState(false)
  const tableContainerRef = useRef(null)
  const { t } = useTranslation()
  const isFirstRender = useRef(true)
  const scrollTable = (scrollAmount) => {
    const table = tableContainerRef.current
    if (table) {
      // You can adjust the scroll amount as needed
      const currentScrollLeft = table.scrollLeft
      // console.log(currentScrollLeft + 'before');
      table.scrollTo(scrollAmount, 0)
      // console.log(table.scrollLeft + 'after');
    }
  }
  const [dropdownPosition, setDropdownPosition] = useState({
    x: null,
    y: null,
  })
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (dropdownRef.current) {
      const tmpPosition = JSON.parse(JSON.stringify(dropdownPosition))
      if (tmpPosition.left + dropdownRef.current.clientWidth >= window.innerWidth) {
        // console.log('overflowww');
        tmpPosition.left = tmpPosition.left - dropdownRef.current.clientWidth - 10
        setDropdownPosition(tmpPosition)
      }
    }
  }, [dropdownPosition, dropdownRef])

  const [showSampleData, setShowSampleData] = useState(false)
  const [run, setRun] = useState(false)
  const [filesSelected, setFilesSelected] = useState([])

  const pushColumn = async ({
    title,
    description,
    unique,
    mandatory,
    computeField,
    search,
    datatype,
    appendColumn = false,
    columnName,
  }) => {
    setAddColumnLoading(true)
    try {
      await api
        .patch(`/conversion/${data?.conversion}/addColumn`, {
          title,
          appendColumn,
          columnName,
          description,
          unique,
          mandatory,
          computeField,
          search,
          datatype,
        })
        .then((res) => {
          toast.success(t("toasts.activation.columnAdded"))
          setAddColumnLoading(false)
          getConversionData().then(() => setAddColumnModal(false))
        })
    } catch (e) {
      toast.error(e.message)
      setAddColumnLoading(false)
      console.log("Error: ", e)
    }
  }
  const handleInputChange = (name, e) => {
    const {
      target: { value },
    } = e
    // console.log(newRowForm?.current,'newRowForm current')
    newRowForm.current = { ...newRowForm.current, [name]: value }
  }
  const editColumn = async ({
    title,
    description,
    unique,
    mandatory,
    computeField,
    search,
    header,
    connectedClassifier,
    connectedClassifierField,
    connectedClassifierFileName,
    datatype,
    columnName,
  }) => {
    try {
      await api
        .patch(`/conversion/${data?.conversion}/editColumnTitle`, {
          columnName,
          updatedName: title,
          description,
          unique,
          mandatory,
          header,
          connectedClassifier,
          connectedClassifierField,
          connectedClassifierFileName,
          computeField,
          search,
          datatype,
        })
        .then((res) => {
          toast.success(t("toasts.activation.columnUpdated"))
          setEditColumnTitleLoading(false)
          getConversionData().then(() => setEditColumnTitle(false))
        })
    } catch (e) {
      toast.error(e.message)
      setEditColumnTitleLoading(false)
      console.log("Error: ", e)
    }
  }

  const deleteColumn = async (columnName) => {
    try {
      await api
        .patch(`/conversion/${data?.conversion}/deleteColumn`, {
          title: columnName,
        })
        .then(async (res) => {
          toast.success(t("toasts.activation.columnDeleted"))
          await getConversionData()
        })
    } catch (e) {
      toast.error(e.message)
      console.log("Error: ", e)
    }
  }

  const fieldSelectRef = useRef()

  const [connections, setConnections] = useState(null)
  const [isConnectionsLoading, setIsConnectionsLoading] = useState(true)

  const [selectedConnection, setSelectedConnection] = useState(null)
  const [fields, setFields] = useState([])
  const [isFieldsLoading, setIsFieldsLoading] = useState(false)

  const [resource1, setResource1] = useState(null)
  const [resource2, setResource2] = useState(null)
  const [resource3, setResource3] = useState(null)
  const [resource4, setResource4] = useState(null)

  const [selectedFieldsOptions, setSelectedFieldsOptions] = useState({})
  const [mappings, setMappings] = useState({})

  const [integrationMapping, setIntegrationMapping] = useState(null)
  const [isMappingSaving, setIsMappingSaving] = useState(false)
  const [isMappingDeleting, setIsMappingDeleting] = useState(false)
  const [selectedConversion, setSelectedConversion] = useState("Conversion")

  const handleFieldsLoading = (loading) => {
    setIsFieldsLoading(loading)
  }

  const fetchIntegrationMapping = useCallback(
    async (conversion) => {
      try {
        const response = await api.get(`/integrations/mapping/${conversion}`)
        setIntegrationMapping(response.data)
      } catch (error) {
        console.error("Error fetching IntegrationMapping:", error)
      }
    },
    [setIntegrationMapping],
  )

  const handleSelectMappingChange = useCallback(
    (selectedOption, header) => {
      setMappings((prevMappings) => {
        if (!selectedOption) {
          const newMappings = { ...prevMappings }
          delete newMappings[header]
          return newMappings
        }
        return {
          ...prevMappings,
          [header]: selectedOption,
        }
      })

      setSelectedFieldsOptions((prevSelectedOptions) => {
        if (!selectedOption) {
          const newSelectedOptions = { ...prevSelectedOptions }
          delete newSelectedOptions[header]
          return newSelectedOptions
        }
        return {
          ...prevSelectedOptions,
          [header]: selectedOption ? selectedOption.value : null,
        }
      })
    },
    [setMappings, setSelectedFieldsOptions],
  )

  const isOptionDisabled = (option, currentHeader) => {
    if (!selectedFieldsOptions) {
      return false
    }
    const isSelectedInSession = Object.entries(selectedFieldsOptions).some(([header, value]) => {
      //return header !== currentHeader && value === option.value;
      return header !== currentHeader && String(value) === String(option.value)
    })

    const isSelectedInDB =
      integrationMapping &&
      Object.values(integrationMapping.mapping).some((mapping) => {
        // console.log('mapping.value', typeof mapping.value); //string
        // console.log('option.value', typeof option.value); //number
        //return mapping.value === option.value && mapping.header !== currentHeader;
        return String(mapping.value) === String(option.value) && mapping.header !== currentHeader
      })

    return isSelectedInSession || isSelectedInDB
  }

  const setResource1FromSelect = useCallback(
    (resource) => {
      setResource1(resource)
    },
    [setResource1],
  )

  const setResource2FromSelect = useCallback(
    (resource) => {
      setResource2(resource)
    },
    [setResource2],
  )

  const setResource3FromSelect = useCallback(
    (resource) => {
      setResource3(resource)
    },
    [setResource3],
  )

  const setResource4FromSelect = useCallback(
    (resource) => {
      setResource4(resource)
    },
    [setResource4],
  )

  const handleMappingSave = useCallback(async () => {
    // console.log('integrationMapping',integrationMapping);
    // console.log('selectedConnection',selectedConnection);
    // console.log('conId',conId);
    // console.log('resource1',resource1);
    // console.log('mappings',mappings);
    // console.log('selectedConverion', selectedConversion);

    if (!integrationMapping && (!selectedConnection || !resource1 || !mappings || Object.keys(mappings).length === 0)) {
      console.error("Error: Missing required fields for saving mapping.")
      toast(t("toasts.errors.requiredFields"), {
        type: "error",
        position: "top-center",
        hideProgressBar: "true",
        theme: "colored",
      })
      return
    }

    setIsMappingSaving(true)

    try {
      const response = await api.post("/integrations/save-mapping", {
        integrationconnection: selectedConnection?.value,
        conversion: conId,
        resource1: resource1,
        resource2: resource2,
        resource3: resource3,
        resource4: resource4,
        mapping: mappings,
      })

      if (response?.status === 201) {
        setIntegrationMapping(response.data)
      } else {
        console.error("Failed to save mapping:", response)
      }
    } catch (error) {
      console.error("Error saving mapping:", error)
    } finally {
      setIsMappingSaving(false)
    }
  }, [integrationMapping, selectedConnection, resource1, resource2, resource3, resource4, mappings])

  const handleDeleteMapping = useCallback(async () => {
    setIsMappingDeleting(true)

    try {
      const response = await api.delete(`/integrations/mapping/${integrationMapping._id}`)
      if (response.status === 200) {
        // console.log('Mapping deleted successfully');
        setFields(null)
        setMappings(null)
        setSelectedFieldsOptions(null)
      } else {
        console.error("Failed to delete mapping")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsMappingDeleting(false)
      setSelectedConnection(null)
      setIntegrationMapping(null)
      setFields(null)
      setMappings(null)
    }
  }, [
    integrationMapping,
    setIsMappingDeleting,
    setFields,
    setMappings,
    setSelectedFieldsOptions,
    setSelectedConnection,
    setIntegrationMapping,
  ])

  const handleDeleteField = useCallback(
    async (field) => {
      setIsMappingDeleting(true)
      try {
        const response = await api.delete(
          `/integrations/mapping/field/${integrationMapping._id}/${encodeURIComponent(field)}`,
        )
        if (response.status === 200) {
          fetchIntegrationMapping(selectedConversion?._id)
        } else {
          console.error("Failed to delete mapping field")
        }
      } catch (error) {
        console.error("Failed to delete field:", error)
      } finally {
        setIsMappingDeleting(false)
      }
    },
    [integrationMapping, setIsMappingDeleting, fetchIntegrationMapping, selectedConversion],
  )

  const fetchActiveConnections = useCallback(
    async (userId) => {
      setIsConnectionsLoading(true)
      try {
        const response = await api.get(`/integrations/${userId}/active-connection`)

        if (response.status === 204 || response.data.message === "No content") {
          setConnections([])
        } else if (response.data) {
          const formattedConnections = response.data.map((conn) => ({
            value: conn._id,
            label: conn.integration.name,
            authDetails: conn.authDetails,
          }))
          setConnections(formattedConnections)
        } else {
          setConnections(null)
        }
      } catch (error) {
        console.error("Error fetching active connections:", error)
        setConnections(null)
      } finally {
        setIsConnectionsLoading(false)
      }
      // If userId is a prop or state that this callback depends on, it should be included in the dependencies array
    },
    [setIsConnectionsLoading, setConnections],
  )

  const handleFieldsFetched = useCallback(
    (fields) => {
      setMappings(null)
      setFields(fields)
    },
    [setFields, setMappings],
  )

  const handleConnectionChange = useCallback(
    (selectedOption) => {
      setSelectedConnection(selectedOption)
      setFields([])
      setMappings([])
    },
    [setSelectedConnection, setFields, setMappings],
  )

  const [refreshConversionHistory, setRefreshConversionHistory] = useState(false)

  useEffect(() => {
    // console.log('useEffect called')

    if (integrationMapping && connections) {
      const connectionFromDB = connections?.find(
        (connection) => connection.value === integrationMapping?.integrationconnection?._id,
      )
      setSelectedConnection(connectionFromDB)
      // console.log('connectionFromDB', connectionFromDB);
    }

    setSelectedConnection(null)
    setIntegrationMapping(null)
    setFields([])
    setMappings([])

    //integrationMapping, connections, isMappingDeleting,
  }, [window.location.search, refreshConversionHistory])

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("user"))?._id
    fetchActiveConnections(userId)
  }, [])

  const [integrationLogs, setIntegrationLogs] = useState([])

  const { list, setListItems, openSideBar, setOpenSideBar, setFetchConversions } = useContext(ListContext)
  const { setUserDetails, userDetails } = useContext(AuthContext)

  const { userPlan, search, handleValidatePlan } = useContext(PlansContext)

  const { width } = useWindowDimensions()
  const [step, setStep] = useState("step2")
  const [show, setShow] = useState(false)
  const [maxSizeErr, setMaxSizeErr] = useState(false)
  const [tableHeaders, setTableHeaders] = useState(null)
  const [tableAttributes, setTableAttributes] = useState(null)
  const [tableData, setTableData] = useState(null)
  const [data, setData] = useState(null)
  const [loadingConversionData, setLoadingConversionData] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const [file, setfile] = useState("")
  const [convertedFile, setConvertedfile] = useState([])
  const [loading, setLoading] = useState([])
  const [appendedModal, setAppendedModal] = useState(false)
  const [googleSheetShow, setGoogleSheetShow] = useState(false)
  const [uploadShow, setUploadShow] = useState(false)
  const [uploadTextShow, setUploadTextShow] = useState(false)
  const [merge, setMerge] = useState(false)
  const [searchQuery, setSearchQuery] = useState(false)
  const [pagination, setPagination] = useState(false)
  const [entireWebsite, setEntireWebsite] = useState(false)
  const [noOfPages, setNoOfPages] = useState(2)
  const [conId, setConId] = useState("")
  const [open, setOpen] = useState(false)
  const [sheetDetailsWrite, setSheetDetailsWrite] = useState(null)
  const [sheetDetails, setSheetDetails] = useState(null)
  const [updateSheetLoading, setUpdateSheetLoading] = useState(false)
  const [editModal, setEditModal] = useState(false)

  const [textCheckBox, setTextCheckBox] = useState(false)
  const [templates, setTemplates] = useState([])

  const [loadingData, setLoadingData] = useState("")
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  const handleGoogleShow = () => setGoogleSheetShow(!googleSheetShow)
  const handleUpload = () => setUploadShow(!uploadShow)
  const handleUploadText = () => setUploadTextShow(!uploadTextShow)
  const handleEditModal = () => setEditModal(!editModal)

  const [conversionHistory, setConversionHistory] = useState([])
  const [indexEdit, setIndexEdit] = useState(-1)
  const [deleteRowLoading, setDeleteRowLoading] = useState(-1)

  const socket = io(import.meta.env.VITE_SOCKET_IO_URL, {
    transports: ["websocket"],
    withCredentials: true,
  })

  socket.emit("join", JSON.parse(localStorage.getItem("user"))?._id)

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const id = urlParams.get("id")
    setConId(id)
    getSingleConverion(id)
  }, [window.location.search, list])

  useEffect(() => {
    const handleTaskComplete = (data) => {
      // console.log('Task completed:', data);
      setRefreshConversionHistory((prev) => !prev)
      // toast.info(
      //   `Task completed on file: ${data?.taskData?.file?.originalname}`,
      // );
      // Direct state update example
      // setTasks(prevTasks => [...prevTasks, data.taskData]);
    }

    const handleTaskError = (errorData) => {
      console.error("Task failed:", errorData.error)
      setRefreshConversionHistory((prev) => !prev)
      // toast.error(`Task failed on file: ${errorData?.error}`);
      // Direct state update example
      // setErrorTasks(prevErrorTasks => [...errorTasks, errorData.error]);
    }

    socket.on("file-conversion-success", handleTaskComplete)
    socket.on("file-conversion-error", handleTaskError)

    return () => {
      socket.off("file-conversion-success", handleTaskComplete)
      socket.off("file-conversion-error", handleTaskError)

      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (connections && integrationMapping && integrationMapping?.message !== "No Content") {
      const selectedConnectionObj = connections?.find(
        (connection) => connection.value === integrationMapping?.integrationconnection?._id,
      )

      if (selectedConnectionObj) {
        handleConnectionChange(selectedConnectionObj)
      }
    }
    // console.log('selectedConnection', selectedConnection);
  }, [integrationMapping])

  useEffect(() => {
    console.log("DEBUG: Home useEffect triggered with list:", list)
    getConversionData()
  }, [list])

  useEffect(() => {
    refreshMainTableAsHistoryUpdates(true)
  }, [refreshConversionHistory])

  useEffect(() => {
    const controller = new AbortController()

    if (conId == null || conId === "") {
      return
    }

    const updateHistory = () => {
      getConversionHistory(controller.signal)
      fetchIntegrationLogs(controller.signal)
      // setRefreshConversionHistory(prev => !prev);
    }

    // Initial call
    updateHistory()

    // const interval = setInterval(() => {
    //   updateHistory();
    // }, 5000);

    return () => {
      // clearInterval(interval);
      controller.abort()
    }
  }, [conId, refreshConversionHistory])

  useEffect(() => {
    if (conId == null || conId === "") {
      return
    }

    fetchIntegrationMapping(conId)
  }, [conId])

  const getTemplates = async () => {
    const res = await api.get(`/templates/getTemp`)
    setTemplates(res?.data ? res.data : [])
  }

  useEffect(() => {
    getTemplates()
  }, [])

  const readFile = async (selectedFile, id, templateId, additionalData) => {
    const file = selectedFile
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (result) => {
        const head = result?.meta?.fields || []
        let data
        const dupData = []

        if (result?.data?.length > 5) {
          data = result?.data?.slice(0, 5)
        } else {
          data = result?.data
        }

        dupData.push(head)
        data?.forEach((val) => {
          const list = []

          head?.forEach((val2) => {
            list.push(val[val2])
          })

          dupData.push(list)
        })

        if (dupData?.length > 0) {
          const userId = JSON.parse(localStorage.getItem("user"))?._id

          setfile(selectedFile)
          setStep("step2")

          const values = {
            user: userId,
            data: [{ tableHeaders: head, tableData: dupData }],
            csvFileName: selectedFile?.name,
            csvFileSize: selectedFile?.size,
            conversion: id ? id : list,
            sheetDetailsWrite: { empty: "" },
            csvFile: selectedFile,
            templateId: templateId,
            ...additionalData,
          }
          try {
            api.post("/conversion/addData", values).then((res) => {
              if (id) {
              } else {
                getConversionData(true)
              }
            })
          } catch (error) {
            console.log("Error", error)
          }
        }
      },
      header: true,
    })
  }

  const getData = async () => {
    const res = await api.get(`/templates/getDefaultTemplates`)

    if (res?.data?.length > 0) {
      for (const item of res?.data) {
        const userId = JSON.parse(localStorage.getItem("user"))?._id
        const body = {
          name: item?.title,
          user: userId,
          templateId: item?._id,
        }
        const res2 = await api.post("/conversion", body)

        const file = new File([item?.data], "", {
          type: "text/csv",
        })
        await readFile(file, res2.data?.createConversion?._id, item?._id)
      }
      api
        .patch("/user/updateDefault", {
          default: true,
        })
        .then(async (res) => {
          setFetchConversions(true)
        })
    }
  }
  const getUsr = async () => {
    // const usr = JSON.parse(localStorage.getItem('user'));
    const res = await api.get(`/user/userDetails`)
    // console.log(res?.data?.defaultAdded);

    if (!res?.data?.defaultAdded) {
      await getData()
    }
  }
  useEffect(() => {
    getUsr()
  }, [])

  const handleChangeCsv = (e) => {
    const file = e.target.files[0]
    // if (file?.size / 1024 / 1024 > 0.1) {
    //   setMaxSizeErr(true);
    //   toast(`Maximum file size should be ${userPlan[0]?.maxFileSize} MB`, {
    //     type: 'warning',
    //   });
    // } else {
    readFile(file)
    // }
  }
  useEffect(() => {
    if (tableData && selectedConversion?.name) {
      // console.log('starting joyride');
      if (step === "step1") {
        // setRun(true);
        setRun(false)
        // setJoyride1(true);
        //setJoyride1(false);
      } else {
        //setJoyride1(false);
      }
      setTimeout(() => {
        // console.log('Delayed for 1 second.');
        // setRun(true);
        setRun(false)
      }, "500")
    }
  }, [tableData])

  useEffect(() => {
    if (step === "step1") {
      // setRun(true);
      setRun(false)
      // setJoyride1(true);
      //setJoyride1(false);
    } else {
      //setJoyride1(false);
    }
    setTimeout(() => {
      // console.log('Delayed for 1 second.');
      // setRun(true);
      setRun(false)
    }, "500")
  }, [])

  const getConversionData = async (set = false) => {
    console.log("DEBUG: getConversionData called with list:", list)
    if (list) {
      try {
        setLoadingConversionData(true)
        console.log("DEBUG: Fetching data for conversion:", list)
        const res = await api.get(`/conversion/getData/${list}`)
        setData(res?.data)

        if (res?.data) {
          setLoadingConversionData(false)
          setTableHeaders(res?.data?.data[0]?.tableHeaders)
          setTableAttributes(res?.data?.data[0]?.tableAttributes)
          // console.log(tableHeaders);
          setfile({
            name: res?.data?.csvFileName,
            size: res?.data?.csvFileSize,
          })

          setTableData(res?.data?.data[0]?.tableData)
          setStep("step2")
          //setJoyride1(false);
        } else {
          setLoadingConversionData(false)
          setfile(null)
          setTableHeaders(null)
          setTableAttributes(null)
          setTableData(null)
          setStep("step2")
          // setJoyride1(true);
          //setJoyride1(false);
        }
      } catch (error) {
        console.error("Error fetching conversion data:", error)
        setStep("step2")
        setLoadingConversionData(false)
      }
      setLoadingData("")
      setTextCheckBox(false)
      setMerge(false)
      setUpdateSheetLoading(false)
    }
  }
  const generatedTableData = useMemo(() => {
    let td = []
    // Include sample data with `isSample: true`
    if (showSampleData) {
      td = tableData.map((item) => ({ ...item, isSample: true })) // No need for spread operator here
    }

    // Include converted data
    if (data?.convertedData) {
      const { tableHeaders = [] } = data?.data?.[0] || {}
      data.convertedData.forEach((el) => {
        const arr = tableHeaders.map((key) => el?.[key] ?? null) // Handle undefined keys with null fallback
        td.push(arr)
      })
    }

    return td
  }, [tableData, data, showSampleData])

  // console.log('generatedTableData => ', generatedTableData)
  const refreshMainTableAsHistoryUpdates = async (set = false) => {
    if (list) {
      try {
        const res = await api.get(`/conversion/getData/${list}`)
        setData(res?.data)

        if (res?.data) {
          setTableHeaders(res?.data?.data[0]?.tableHeaders)
          setTableAttributes(res?.data?.data[0]?.tableAttributes)
          setfile({
            name: res?.data?.csvFileName,
            size: res?.data?.csvFileSize,
          })

          setTableData(res?.data?.data[0]?.tableData)
          setStep("step2")
          //setJoyride1(false);
        } else {
          setfile(null)
          setTableHeaders(null)
          setTableAttributes(null)
          setTableData(null)
          setStep("step2")
          // setJoyride1(true);
          //setJoyride1(false);
        }
      } catch (error) {
        console.log("Error", error)
      }
      setLoadingData("")
      // setTextCheckBox(false);
      // setMerge(false);
      setUpdateSheetLoading(false)
    }
  }

  useEffect(() => {
    handleValidatePlan()
  }, [])

  const getSingleConverion = async (id) => {
    id = id || list
    const userId = JSON.parse(localStorage.getItem("user"))?._id
    const res = await api.get(`/conversion/all-notes/${userId}`)

    if (id) {
      const selectedConversion = res.data.getAllConversion.find((conversion) => conversion._id === id)
      setSelectedConversion(selectedConversion)
      //console.log('selectedConversion',selectedConversion);
    } else {
      setSelectedConversion("Conversion")
    }
  }

  const getConversionHistory = useCallback(
    async (signal) => {
      setIsTransformationHistoryLoading(true)
      const userId = JSON.parse(localStorage.getItem("user"))?._id
      const params = { userId: userId, conversionId: conId }

      try {
        const res = await api.get(`/conversion/history/getConversionHistory`, {
          params: params,
          signal: signal,
        })

        if (res?.data?.status === "success" && res?.data?.data) {
          setConversionHistory(res.data.data)
        } else {
          setConversionHistory([])
        }
      } catch (error) {
        if (error.name === "AbortError") {
          // console.log('Request was aborted');
        } else {
          setConversionHistory([])
        }
      } finally {
        setIsTransformationHistoryLoading(false)
      }
    },
    [conId, setConversionHistory],
  )

  const [isIntegrationLogsLoading, setIsIntegrationLogsLoading] = useState(false)
  const [isTransformationHistoryLoading, setIsTransformationHistoryLoading] = useState(false)

  const fetchIntegrationLogs = useCallback(
    async (signal) => {
      setIsIntegrationLogsLoading(true)
      const userId = JSON.parse(localStorage.getItem("user"))?._id
      const conversionId = conId

      try {
        const response = await api.get(`/integrations/logs/${userId}/${conversionId}`, { signal })
        setIntegrationLogs(response.data)
      } catch (error) {
        console.error("Error fetching integration logs:", error)
        setIntegrationLogs([])
      } finally {
        setIsIntegrationLogsLoading(false)
      }
    },
    [conId, list, setIntegrationLogs],
  )

  const handleReload = () => {
    try {
      api.delete(`/conversion/delData/${list}`)
      setData(null)
      setConvertedfile(convertedFile?.filter((el) => el?.list !== list))
      handleClose()
      setStep("step2")
    } catch (error) {
      console.log("Error", error)
    }
  }

  function downloadExcel() {
    const ws = XLSX.utils.json_to_sheet(data?.convertedData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Transformed-Data")
    XLSX.writeFile(wb, "Data.xlsx")
  }
  const downloadCSV = () => {
    if (!data?.convertedData?.length) return

    const csvContent = Papa.unparse(data.convertedData)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "Data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadJSON = () => {
    if (!data?.convertedData?.length) return

    const jsonString = JSON.stringify(data.convertedData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "Data.json")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const prepareUploadData = (
    selectedFiles,
    loadingTemp,
    returnRowsLimit,
    model,
    isBackground,
    processUrlsProp,
    conversionId,
    mergeModal,
    templateDefaults,
  ) => {
    setLoadingData(loadingTemp)
    setLoading([...loading, list])

    const allFiles = convertedFile?.filter((el) => el?.list !== list)
    setConvertedfile([...allFiles, { name: selectedFiles[0]?.name, list }])

    const finalTxtData = []

    tableData?.forEach((el) => {
      const obj = {}
      tableHeaders?.forEach((hd, i) => {
        obj[hd] = el[i]
      })
      delete obj["Date/Time"]
      delete obj["FileName"]
      finalTxtData.push(obj)
    })

    const formData = new FormData()

    formData.append("isBackground", isBackground)
    formData.append("processUrls", `${processUrlsProp || textCheckBox || loadingTemp === "2" ? true : false}`)
    formData.append("pagination", textCheckBox && pagination)
    formData.append("entireWebsite", textCheckBox && entireWebsite)
    textCheckBox && pagination && formData.append("pagination_max_iteractions", noOfPages)
    formData.append("returnRowsLimit", `${returnRowsLimit ? returnRowsLimit : null}`)
    formData.append("merge", `${mergeModal || merge ? true : false}`)
    formData.append("search", `${searchQuery}`)
    formData.append("model", `${model ? model : 1}`)
    formData.append("id", conversionId || conId)

    // Append each selected file individually
    selectedFiles?.forEach((file, index) => {
      formData.append(`files`, file)
    })

    formData.append("templateDefaults", templateDefaults)

    return formData
  }

  const handleAPIResponse = async (apiResponse) => {
    const res = apiResponse?.data

    handleValidatePlan()
    if (res?.status_code) {
      document.getElementById("upload_file_convert").value = ""
      toast(`${res?.detail}`, { type: "error" })
      if (loading?.length > 0) {
        setLoading(loading?.filter((el) => el !== list))
      }
      setLoadingData("")
    } else if (res?.data?.length > 0) {
      setUploadShow(false)
      setUploadTextShow(false)
      getConversionData()
      document.getElementById("upload_file_convert").value = ""
      setAppendedModal(true)
      setLoading(loading?.filter((el) => el !== list))
    } else if (res?.data?.length === 0) {
      setLoadingData("")
    }
  }

  const handleUploadFile = async (
    selectedFiles,
    loadingTemp,
    returnRowsLimit,
    model,
    isBackground,
    processUrlsProp,
    conversionId,
    mergeModal,
    templateDefaults = false,
  ) => {
    const formData = prepareUploadData(
      selectedFiles,
      loadingTemp,
      returnRowsLimit,
      model,
      isBackground,
      processUrlsProp,
      conversionId,
      mergeModal,
      templateDefaults,
    )
    //formData.append('isBackground', isBackground);

    const apiEndpoint = "/conversion/uploadFilesToDb"

    let processStatusId // Will store the ID of the created process status for patching later

    try {
      // console.log('formData', formData);

      if (isBackground) {
        const temperedFile =
          selectedFiles?.length > 0
            ? {
                ...selectedFiles?.[0],
                name: selectedFiles?.map((fi) => fi?.name)?.toString(),
              }
            : file
        toast(<NotificationMsg file={temperedFile} />, {
          hideProgressBar: true,
          pauseOnFocusLoss: false,
          closeOnClick: false,
          draggable: false,
          pauseOnHover: false,
        })
      }

      const apiResponse = await api.post(apiEndpoint, formData)

      // setRefreshConversionHistory(!refreshConversionHistory);
      setRefreshConversionHistory((prev) => !prev)

      await handleAPIResponse(apiResponse)
    } catch (error) {
      if (processStatusId) {
        await api.patch(`/conversion/history/patchConversionHistory/${processStatusId}`, {
          status: "Error",
          endTime: new Date(),
          errorMessage: error?.response?.data?.error || error?.response?.data?.message || error?.message || "Error",
        })
        // setRefreshConversionHistory(!refreshConversionHistory);
        setRefreshConversionHistory((prev) => !prev)
      }

      toast(error?.response?.data?.error || error?.response?.data?.message || error?.message || "Error", {
        type: "error",
      })
      setUploadShow(false)
      if (loading?.length > 0) {
        setLoading(loading?.filter((el) => el !== list))
      }
      setLoadingData("")
    }
  }

  const handleChangeUploadFile = async (e, returnRowsLimit, model, isBackground) => {
    const files = e.target.files
    // console.log('e--', Object.values(files));
    if (
      Object.values(files)?.some((file) => file?.size / 1024 / 1024 > userPlan[0]?.maxFileSize) &&
      userPlan?.length > 0
    ) {
      toast(`Maximum file size should be ${userPlan[0]?.maxFileSize} MB`, {
        type: "warning",
      })
    } else {
      if (isBackground) {
        handleUploadFile(Object.values(files), "1", returnRowsLimit, model, isBackground) // '1' indicates background loading
        //toast.info(`Background process has started on file: ${file.name}`);
      } else {
        handleUploadFile(Object.values(files), "0", returnRowsLimit, model, isBackground)
      }
    }
  }

  const handleAddRow = async (dataToAdd) => {
    // console.log(dataToAdd,"dataToAdd")
    setAddRowLoading(true)
    try {
      await api
        .put(`/conversion/${data?.conversion}/addRow`, {
          header: tableHeaders,
          row: dataToAdd,
          conversion: !rowTypeSample,
        })
        .then((res) => {
          setAddRowLoading(false)
          getConversionData().then(() => setAddRowModal(false))
        })
    } catch (e) {
      setAddRowLoading(false)
      console.log("Error", e)
    }
  }

  const handleUpdateRow = async (newData, idx, isSample) => {
    try {
      const payload = data

      if (payload.data?.length > 0 && payload?.data[0]?.tableData) {
        !isSample
          ? (payload.convertedData[idx] = newData[idx])
          : (payload.data[0].tableData[idx] = Object.values({
              ...newData[idx],
            }))
        try {
          const res = await api
            .put(`/conversion/updateConversion/${data?.conversion}`, {
              ...payload,
              rowToEdit: idx,
            })
            .then((res) => {
              handleClose()
              setLoading(false)
            })
        } catch (e) {
          setLoading(false)
        }
      }
    } catch (error) {}
  }

  // const handleDeleteRow = async (row, index, isSample = true, rowType ,recordToDeleteIsSample) => {
  //   console.log(recordToDeleteIsSample,"recordToDeleteIsSample" ,rowType,"tghckhchcgjjgjjcjhcjcjjjhhjc" ,index,"indexindex")
  //   const isDeleted=Array.isArray(recordToDeleteIsSample)?true:false

  //   try {
  //     setDeleteRowLoading(`${rowType + index}`);
  //     let deleteRow = await api.delete(
  //       `/conversion/${conId}/delete?row=${index}&convertedData=${isDeleted}`,
  //     );
  //     if (deleteRow) {
  //       await getConversionData();
  //       setDeleteRowLoading(-1);
  //       return true;
  //     }
  //     return false
  //   } catch (error) {
  //     setDeleteRowLoading(-1);
  //     console.log('handleDeleteRow error: ', error);
  //     return false
  //   }
  // };
  const handleDeleteRow = async (row, index, type, rowType) => {
    setDeleteRowLoading(`${rowType + index}`)
    try {
      const deleteRow = await api.delete(
        `/conversion/${conId || list}/delete?row=${index}&convertedData=${type !== "csv"}`,
      )
      if (deleteRow) {
        await getConversionData()
        setDeleteRowLoading(-1)
      }
    } catch (error) {
      setDeleteRowLoading(-1)
      console.log("Error: ", error)
    }
  }

  const handleWriteReportSelected = (sheetDetails) => {
    // console.log('Debug: handleWriteReportSelected called with', { sheetDetails });
    setSheetDetailsWrite(sheetDetails)
    setUpdateSheetLoading(true)
    api
      .patch(`/conversion/updateData/${conId || list}`, {
        sheetDetailsWrite: sheetDetails,
      })
      .then((res) => {
        // console.log('Debug: updateData API response:', res);
        getConversionData()
        handleGoogleShow()
      })
      .catch((error) => {
        // console.error('Debug: Error updating sheet details:', error);
        setUpdateSheetLoading(false)
      })
  }

  const unlinkGoogleSheet = (type) => {
    setSheetDetailsWrite(null)
    setSheetDetails(null)

    api
      .patch(`/conversion/updateData/${conId || list}`, {
        sheetDetailsWrite: { empty: "" },
      })
      .then((res) => {
        getConversionData()
        if (type === "disconnectGoogle") {
          setGoogleSheetShow(false)
        }
      })
  }

  useEffect(() => {
    if (data?.sheetDetailsWrite && data?.sheetDetailsWrite?.empty === "") {
      setSheetDetails(null)
    } else if (data?.sheetDetailsWrite) {
      setSheetDetails(data?.sheetDetailsWrite)
    } else {
      setSheetDetails(null)
    }
  }, [data])

  const handlePaste = () => {
    navigator.clipboard
      .readText()
      .then((clipboardText) => {
        if (clipboardText?.length > 0) {
          const file = new File([clipboardText], "", {
            type: "text/csv",
          })
          readFile(file)
        }
      })
      .catch((error) => {
        console.log("Failed to read clipboard data:", error)
      })
  }

  // Replace the existing convertData function with this more robust version
  const convertData = (date) => {
    try {
      if (!date) return ""

      // First try parsing as ISO date
      let parsedDate = new Date(date)

      // If invalid, try adding UTC
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date(date + " UTC")
      }

      // If still invalid, return empty string
      if (isNaN(parsedDate.getTime())) {
        return ""
      }

      return parsedDate.toLocaleString()
    } catch (error) {
      console.warn("Error converting date:", error)
      return ""
    }
  }
  const getImgName = (img) => {
    const imgs = img?.split("/")
    return imgs?.length > 0 ? imgs[imgs.length - 1] : ""
  }

  const [rowTypeSample, setRowTypeSample] = useState(false)
  const [addRowModal, setAddRowModal] = useState(false)
  const [addRowLoading, setAddRowLoading] = useState(false)

  const [appendColumn, setAppendColumn] = useState(false)
  const [addColumnModal, setAddColumnModal] = useState(false)
  const [addColumnLoading, setAddColumnLoading] = useState(false)
  const [editColumnTitleLoading, setEditColumnTitleLoading] = useState(false)
  const [editColumnTitle, setEditColumnTitle] = useState(false)

  const [dropDownColumn, setDropDownColumn] = useState(-1)
  const [deleteColumnLoading, setDeleteColumnLoading] = useState(-1)
  const [selectedColumnName, setSelectedColumnName] = useState("")
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(-1)

  const openAddRowModal = (sampleData = false) => {
    if (tableHeaders?.length > 2) {
      setRowTypeSample(sampleData)
      setAddRowModal(true)
    } else {
      toast(t("toasts.errors.addColumnFirst"), { type: "warning" })
    }
  }
  const openAddColumnModal = (end = false, name) => {
    setSelectedColumnName(name)
    setAppendColumn(end)
    setAddColumnModal(true)
  }

  const handleClickOutside = (event) => {
    // console.log('clicked outside', event.target);
    if (event.target.className !== "dotsIcon") {
      setDropDownColumn(-1)
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])
  const [openPlan, setOpenPlan] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  function extractDateFromString(name) {
    // Define a regular expression pattern to match the date format
    const dateRegex = /\b(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\b/
    // Use the match method to find the date in the string
    const matchResult = name?.match(dateRegex)
    // Check if a match is found
    if (matchResult && matchResult[1]) {
      // Parse the input date string using Moment.js
      const inputMoment = moment(new Date(matchResult[1] + " UTC")?.toLocaleString(), "M/D/YYYY, h:mm:ss A")

      // Format the date in the desired custom format
      const formattedDate = inputMoment.format("YYYY-MM-DD HH:mm")
      return `${name?.split(matchResult[1])?.[0]} ${formattedDate}`
    } else {
      // Return null if no date is found
      return name
    }
  }
  const grabData = (value) => {
    const { Pagination, merge, model, pagination_max_iteractions, processUrls, entireWebsite, search } = value ?? {}
    return {
      Pagination,
      merge,
      model,
      pagination_max_iteractions,
      processUrls,
      entireWebsite,
      search,
    }
  }

  const addOrUpdateRow = (rowIndex) => {
    handleAddRow(["", "", ...Object.values(newRowForm.current)])
    setShowNewRowModal(false)
  }

  const [activeTab, setActiveTab] = useState("conversion")

  const TabNavigation = ({ activeTab, onTabChange, selectedConversion, t }) => {
    const tabs = [
      {
        key: "conversion",
        label: selectedConversion === "Conversion" ? "" : t("exportButton.data"),
        disabled: selectedConversion === "Conversion",
      },
      {
        key: "history",
        label: selectedConversion === "Conversion" ? "" : t("exportButton.history"),
        disabled: selectedConversion === "Conversion",
      },
      {
        key: "export",
        label: selectedConversion === "Conversion" ? "" : t("exportButton.exporting"),
        disabled: selectedConversion === "Conversion",
      },
      {
        key: "export-logs",
        label: selectedConversion === "Conversion" ? "" : t("exportButton.button"),
        disabled: selectedConversion === "Conversion",
      },
    ]

    return (
      <div className="flex items-center gap-1 mb-6">
        {tabs.map(
          (tab) =>
            tab.label && (
              <button
                key={tab.key}
                onClick={() => !tab.disabled && onTabChange(tab.key)}
                disabled={tab.disabled}
                style={{
                  position: "relative",
                  fontSize: "1rem", // text-xs
                  fontWeight: 600, // font-semibold
                  transition: "all 0.3s ease-out", // transition-all duration-300 ease-out
                  whiteSpace: "nowrap",
                  padding: "0.5rem 0.75rem", // py-2 px-3
                  borderRadius: "0.5rem", // rounded-lg
                  border: "2px solid",
                  borderColor: activeTab === tab.key ? "#10b981" : "transparent", // emerald-500 border
                  color: activeTab === tab.key ? "#059669" : "#4b5563", // emerald-600 vs gray-600
                  cursor: tab.disabled ? "not-allowed" : "pointer",
                  opacity: tab.disabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!tab.disabled && activeTab !== tab.key) {
                    e.currentTarget.style.color = "#111827" // gray-900
                    e.currentTarget.style.borderColor = "#d1d5db" // gray-300
                  }
                }}
                onMouseLeave={(e) => {
                  if (!tab.disabled && activeTab !== tab.key) {
                    e.currentTarget.style.color = "#4b5563" // gray-600
                    e.currentTarget.style.borderColor = "transparent"
                  }
                }}
              >
                {tab.label}
              </button>
            ),
        )}
      </div>
    )
  }
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1030
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])
  console.log(isMobile, "isMobile")

  return (
    <>
      {isMobile && isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="fixed top-1 left-4 z-40 p-2 rounded-md bg-[#1E1E1E] text-white lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <Sidebar
        {...{ openPlan, setOpenPlan, handleUploadFile, search, userPlan }}
        onCollapsedChange={setIsSidebarCollapsed}
        isMobile={isMobile}
        isCollapsed={isSidebarCollapsed}
        setIsMobile={setIsMobile}
      />
      <div className={!openSideBar ? "body" : "closeSidebar_body"}>
        <div
          className="main"
          style={{
            display: "flex",
            minHeight: "100vh",
            overflow: "hidden", // Prevent page-level scrolling
          }}
        >
          {/* Sidebar */}
          {!isMobile && (
            <div
              className="sidebar"
              style={{
                width: isSidebarCollapsed ? "80px" : "280px",
                transition: "width 0.3s ease",
                flexShrink: 0,
              }}
            >
              <Sidebar
                {...{ openPlan, setOpenPlan, handleUploadFile, search, userPlan }}
                onCollapsedChange={setIsSidebarCollapsed}
                isMobile={isMobile}
                isCollapsed={isSidebarCollapsed}
                setIsMobile={setIsMobile}
              />
            </div>
          )}

          {/* Main content */}
          <div
            className="main-content"
            style={{
              flex: 1,
              padding: isMobile ? "8px" : "10px",
              height: "100vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {list === "noPer" ? (
              <div className="d-flex h-100 align-items-center justify-content-center justify-items-center">
                <h2 style={{ marginLeft: width <= 722 ? "" : "300px" }}>
                  You do not have an access to this transformation or the transformation not exists
                </h2>
              </div>
            ) : (
              <>
                {/* <Joyride
                continuous
                callback={onJoyrideCallback}
                // completeCallback={handleJoyrideEnd}
                run={run}
                steps={joyride1 === true ? s1 : s2}
                hideCloseButton
                // scrollToFirstStep
                showSkipButton
                showProgress
              /> */}
                <Header showDemo />
                <div className="header" style={{ flexShrink: 0 }}>
                  <div className="responsive-margin" style={{ position: "relative", marginLeft: "0.8rem" }}>
                    <h1
                      style={{
                        fontSize: "1.5rem", // text-2xl
                        fontWeight: "bold", // font-bold
                        color: "#111827", // text-gray-900
                      }}
                    >
                      {selectedConversion ? extractDateFromString(selectedConversion?.name) : "Conversion"}
                    </h1>
                  </div>

                  <div>
                    {/* Updated the main tabs section to use custom TabNavigation component */}
                    <div style={{ padding: "10px" }}>
                      <TabNavigation
                        activeTab={activeTab || "conversion"}
                        onTabChange={setActiveTab}
                        selectedConversion={selectedConversion}
                        t={t}
                      />

                      {/* Tab Content */}
                      <div
                        className="tab-content"
                        style={{
                          flex: 1,
                          overflow: "auto",
                          display: "flex",
                          flexDirection: "column",
                          minHeight: 0, // Important for flex children to shrink
                        }}
                      >
                        {activeTab === "conversion" && (
                          <div
                            className="conversion-tab"
                            style={{
                              flex: 1,
                              overflow: "visible",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div
                              className="Home_content_main"
                              style={{
                                flex: 1,
                                overflow: "visible",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <div
                                className="home_content"
                                style={{
                                  flex: 1,
                                  overflow: "visible",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <div
                                  className="data_template_main"
                                  style={{
                                    flex: 1,
                                    overflow: "visible",
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <div
                                    className="mb-2 tableMainInner"
                                    style={{
                                      flex: 1,
                                      overflow: "visible",
                                      display: "flex",
                                      flexDirection: "column",
                                      paddingBottom: "80px",
                                    }}
                                  >
                                    <div
                                      className="d-flex"
                                      style={{
                                        width: "100%",
                                        flex: 1,
                                        overflow: "visible",
                                      }}
                                    >
                                      <div
                                        className="tableData"
                                        style={{
                                          width: "100%",
                                          flex: 1,
                                          height: "calc(100vh - 120px)",
                                          display: "flex",
                                          flexDirection: "column",
                                          position: "relative",
                                          overflow: "visible",
                                        }}
                                      >
                                        <ModernDataTable
                                          initialColumns={tableHeaders}
                                          initialData={generatedTableData}
                                          initialAttributes={tableAttributes}
                                          pushColumn={pushColumn}
                                          deleteColumn={deleteColumn}
                                          editColumn={editColumn}
                                          showSampleData={showSampleData}
                                          deleteRow={handleDeleteRow}
                                          addRow={handleAddRow}
                                          updateRow={handleUpdateRow}
                                        />

                                        {/* ... existing modal content ... */}
                                        {/* <Modal
                                          show={showNewRowModal}
                                          onHide={() => {
                                            setShowNewRowModal(false)
                                            setEditingRowIndex(null)
                                          }}
                                        >
                                          <Modal.Header closeButton>
                                            <Modal.Title>
                                              {editingRowIndex !== null ? "Edit Row" : "Add New Row"}
                                            </Modal.Title>
                                          </Modal.Header>
                                          <Modal.Body>
                                            {data?.convertedData?.length &&
                                              Object.entries(data?.convertedData?.[0])?.map((column, index) => {
                                                return (
                                                  index > 1 && (
                                                    <Form.Group key={column[0]} className="mb-3">
                                                      <Form.Label>{column}</Form.Label>
                                                      <Form.Control
                                                        type="text"
                                                        onChange={(e) => {
                                                          handleInputChange(column[0], e)
                                                        }}
                                                      />
                                                    </Form.Group>
                                                  )
                                                )
                                              })}
                                          </Modal.Body>
                                          <Modal.Footer>
                                            <Button
                                              variant="secondary"
                                              onClick={() => {
                                                setShowNewRowModal(false)
                                                setEditingRowIndex(null)
                                              }}
                                            >
                                              Close
                                            </Button>
                                            <Button variant="primary" onClick={handleUpdateRow}>
                                              {editingRowIndex !== null ? "Update Row" : "Add Row"}
                                            </Button>
                                          </Modal.Footer>
                                        </Modal> */}
                                      </div>
                                    </div>
                                  </div>

                                  {/* ... existing controls section ... */}
                                  <div
                                    style={{
                                      position: "fixed",
                                      bottom: 0,
                                      left: isMobile ? "0px" : isSidebarCollapsed ? "80px" : "280px", // shift right depending on sidebar width
                                      right: 0,
                                      backgroundColor: "#fff",
                                      padding: "12px 16px",
                                      boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
                                      zIndex: isMobile ? 0 : 1000,
                                      display: "flex",
                                      flexDirection: width < 990 ? "column" : "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      gap: "12px",
                                      width: isMobile
                                        ? "100%"
                                        : `calc(100% - ${isSidebarCollapsed ? "80px" : "300px"})`, // prevent overlap with sidebar
                                      transition: "all 0.3s ease", // smooth shift when sidebar collapses
                                    }}
                                  >
                                    {/* Google Sheet button */}
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: window.innerWidth >= 640 ? "row" : "column",
                                        alignItems: window.innerWidth >= 640 ? "center" : "flex-start",
                                        gap: window.innerWidth >= 640 ? "12px" : "8px",
                                        maxWidth: window.innerWidth >= 1024 ? "auto" : "100%",
                                      }}
                                    >
                                      <button
                                        style={{
                                          border: "1px solid #d1d5db",
                                          borderRadius: "6px",
                                          padding: "6px 12px",
                                          fontSize: "14px",
                                          fontWeight: 500,
                                          color: "#374151",
                                          backgroundColor: "transparent",
                                          cursor: "pointer",
                                          minWidth: window.innerWidth >= 640 ? "0" : "200px",
                                          whiteSpace: "nowrap",
                                        }}
                                        onClick={handleGoogleShow}
                                        id="datastep"
                                      >
                                        {sheetDetails === null ? t("googleSheet.connect") : t("googleSheet.update")}
                                      </button>
                                    </div>

                                    {/* Checkbox + extra actions */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Checkbox
                                          id="showSampleData"
                                          checked={showSampleData}
                                          onCheckedChange={(checked) => setShowSampleData(checked)}
                                        />
                                        <label
                                          htmlFor="showSampleData"
                                          style={{
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {t("sampleData.checkboxLabel")}
                                        </label>

                                        {/* Tooltip Section */}
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span
                                                style={{
                                                  fontSize: "14px",
                                                  color: "#6b7280",
                                                  cursor: "default",
                                                  display: "inline-flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                }}
                                              >
                                                ℹ
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent
                                              style={{
                                                zIndex: 9999, // 👈 Ensure it appears above the footer
                                                backgroundColor: "white",
                                                padding: "8px 12px",
                                                borderRadius: "4px",
                                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                              }}
                                              side="top"
                                              align="center"
                                              sideOffset={5}
                                            >
                                              <p style={{ margin: 0 }}>{t("sampleData.tooltip")}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>

                                        {/* Show Sample Data Button */}
                                        {showSampleData && (
                                          <button
                                            style={{
                                              border: "1px solid #d1d5db",
                                              borderRadius: "6px",
                                              padding: "6px 12px",
                                              fontSize: "14px",
                                              fontWeight: 500,
                                              color: "#374151",
                                              backgroundColor: "transparent",
                                              cursor: "pointer",
                                              whiteSpace: "nowrap",
                                            }}
                                            onClick={() => openAddRowModal(true)}
                                          >
                                            Add Row to Sample Data
                                          </button>
                                        )}

                                        {/* Developer-only Button */}
                                        {JSON.parse(localStorage.getItem("user"))?.isDeveloper ? (
                                          <button
                                            style={{
                                              border: "1px solid #d1d5db",
                                              borderRadius: "6px",
                                              padding: "6px 12px",
                                              fontSize: "14px",
                                              fontWeight: 500,
                                              backgroundColor: "#f8f9fa",
                                              cursor: "pointer",
                                            }}
                                            onClick={() => openAddRowModal(false)}
                                          >
                                            Add Row to Transformed Data
                                          </button>
                                        ) : (
                                          <div style={{ width: "1px" }} />
                                        )}
                                      </div>
                                    </div>

                                    {/* Export button */}
                                    {data?.convertedData?.length > 0 ? (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button
                                            style={{
                                              backgroundColor: "#16a34a",
                                              color: "white",
                                              border: "none",
                                              borderRadius: "6px",
                                              padding: "6px 12px",
                                              fontSize: "14px",
                                              fontWeight: 500,
                                              minWidth: "120px",
                                              cursor: "pointer",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#15803d")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#16a34a")}
                                          >
                                            {t("export.button")}
                                            <ChevronDown style={{ marginLeft: "8px", height: "16px", width: "16px" }} />
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-white">
                                          <DropdownMenuItem onClick={downloadExcel}>
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            {t("export.excel")}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={downloadCSV}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            {t("export.csv")}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={downloadJSON}>
                                            <Braces className="mr-2 h-4 w-4" />
                                            {t("export.json")}
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    ) : (
                                      <div style={{ width: "150px" }} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      

                    

                        {/* {activeTab === "export-logs" && (
                        <div className="export-logs-tab">
                          <div className="Home_content_main">
                            <div className="home_content">
                              <div className="data_template_main">
                                <Suspense fallback={<div> Loading ... </div>}>
                                  <IntegrationLogsTable
                                    integrationLogs={integrationLogs}
                                    isIntegrationLogsLoading={isIntegrationLogsLoading}
                                  />
                                </Suspense>
                              </div>
                            </div>
                          </div>
                        </div>
                      )} */}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
