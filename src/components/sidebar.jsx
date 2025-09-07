"use client"

import { Formik } from "formik"
import moment from "moment"
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import Select from "react-dropdown-select"
import { AiOutlineArrowDown, AiOutlineArrowUp, AiOutlineCopy, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import * as XLSX from "xlsx"
import { X, Sparkles } from "lucide-react"
import * as yup from "yup"
import {
  Plus,
  Globe,
  User,
  Settings,
  LogOut,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Upload,
  Loader2,
} from "lucide-react"
import api from "../api/index"
import { AuthContext } from "../context/auth"
import { ListContext } from "../context/list"
import { PlansContext } from "../context/plans/plans"
import { getConvertedPlans, getSubscriptionsPlans, plans } from "../service/plan"
import catchAsync from "../utiles/catchAsync"
import useWindowDimensions from "../utiles/getWindowDimensions"
import { useTranslation } from "react-i18next"
import { generateFilenameFromText } from "../utils/fileUtils"
import { HiOutlineBellAlert, HiOutlineBellSlash } from "react-icons/hi2"
import LanguageSwitcher from "./languageSwitcher/languageSwitcher"

const Sidebar = ({ openPlan, setOpenPlan, handleUploadFile, search,  isCollapsed,
  onCollapsedChange,isMobile ,setIsMobile }) => {
  const [load, setLoad] = useState(false)
  const [demoId, setDemoId] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState({
    x: null,
    y: null,
  })
  const [dropDownValue, setDropDownValue] = useState(null)
  const [dataPresentCheck, setDataPresentCheck] = useState("")
  const notesRef = useRef(null)
  const { t } = useTranslation()
  //for creating conversion with templateId and Link
  const [selectConversion, setSelectConversion] = useState(false)
  const [selectedConversion, setSelectedConversion] = useState([
    {
      value: "",
      label: "Select",
    },
  ])
  const [conversionToList, setConversionToList] = useState([])
  const [runOnce, setRunOnce] = useState(true)
  const [processUrlProp, setProcessUrlProp] = useState("")
  const [externalId, setExternalId] = useState("")

  // Template dropdown state and predefined templates
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [templateFilter, setTemplateFilter] = useState("")

  const predefinedTemplates = [
    {
      id: "conference-attendees",
      name: "Conference Attendees",
      description:
        "This transformation is used to collect a list of contacts of speakers and attendees of the conferences including persons' name, position, company name, email, LinkedIn profile, X (Twitter) profile, and the conference name and website.",
    },
    {
      id: "company-information",
      name: "Company Information",
      description:
        "This transformation extracts and organizes company data including company name, industry, headquarters location, employee count, revenue, founded year, website, and key executives information.",
    },
    {
      id: "personal-information",
      name: "Personal Information",
      description:
        "This transformation processes personal contact information including full name, email address, phone number, physical address, date of birth, occupation, and social media profiles.",
    },
    {
      id: "sales-leads",
      name: "Sales Leads",
      description:
        "This transformation organizes potential sales leads including prospect name, company, contact information, lead source, interest level, budget range, and expected closing date.",
    },
    {
      id: "product-catalog",
      name: "Product Catalog",
      description:
        "This transformation structures product information including product name, SKU, category, description, price, specifications, availability status, and supplier details.",
    },
    {
      id: "financial-records",
      name: "Financial Records",
      description:
        "This transformation processes financial data including transaction date, amount, currency, account information, transaction type, description, and reconciliation status.",
    },
    {
      id: "customer-feedback",
      name: "Customer Feedback",
      description:
        "This transformation organizes customer feedback including customer name, feedback date, rating, comments, product/service reviewed, and follow-up actions required.",
    },
    {
      id: "event-management",
      name: "Event Management",
      description:
        "This transformation manages event data including event name, date, location, attendee list, agenda items, speakers, budget, and logistics information.",
    },
  ]

  const filteredTemplates = predefinedTemplates.filter((template) =>
    template.name.toLowerCase().includes(templateFilter.toLowerCase()),
  )

  useEffect(() => {
    if (openPlan) {
      handlePriceModalShow()
    }
  }, [openPlan])
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("") // State for search query
  const [searchList, setSearchList] = useState(null) // State for selected list item

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase())
  }
  const handleNavigateToBilling = () => {
    window.open("https://billing.stripe.com/p/login/4gwdRRaxYaweewE4gg", "_blank")
  }

  const deletedemo = catchAsync(async (id) => {
    try {
      const res = await api.delete(`/conversion/${id}`)
      const currCons = JSON.parse(localStorage.getItem("currentConverstion"))
      if (currCons === id) {
        localStorage.removeItem("currentConverstion")
        setListItems(null)
      }
      const data = conversions.filter((elem) => {
        return elem._id !== id
      })
      setConversions(data)
      if (data?.length === 0) {
        const queryParams = new URLSearchParams(window.location.search)
        queryParams.delete("id")
        navigate("/?" + queryParams.toString())
      } else {
        handleButtonClick(conversions[0]._id)
        setListItems(conversions[0]._id)
        setSearchList(conversions[0]._id)
      }

      setFirstCheckLocation(false)
    } catch (error) {}
  })

  const demo = catchAsync(async (values) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"))?._id
      values.user = userId
      const res = await api.post("/conversion", values)
      setConversions([...conversions, res.data.createConversion])
      setListItems(res.data.createConversion?._id)
      setSearchList(res.data.createConversion?._id)
      setDemoId(res.data.createConversion?._id)
      const queryParams = new URLSearchParams(window.location.search)
      queryParams.delete("id")
      queryParams.append("id", res.data.createConversion?._id)
      navigate("/?" + queryParams.toString())
    } catch (error) {
      console.log("Error", error)
    }
  })
  const onJoyrideCallback = (data) => {
    if (data.index === 0 && data.lifecycle === "tooltip") {
      const name = "demo"
      const val = { name: name }
      demo(val)
    } else if (data.index === 4 && data.lifecycle === "complete") {
      // deletedemo(demoId);
    }
  }

  const steps = [
    {
      index: 0,
      action: "start",
      TOOLTIP: "tooltip",
      status: "running",
      type: "step:before",
      target: "#newstepone",
      placementBeacon: "left",

      content: <p>Create a new Transformation to start</p>,
    },

    {
      index: 1,
      target: ".step-2",
      // type: 'step:before',
      content: <p>Daily remaining operations left according to your subscription</p>,
    },
    {
      index: 2,
      target: "#joyonestep3",
      // type: 'step:before',
      content: (
        <p>
          Step 1 is aimed to feed the AI with the sample of data that you want to collect. It should be just several
          rows of data from 2 to 5 rows, not less, not more. You can upload this sample from a CSV file by hitting this
          button
        </p>
      ),
    },
    {
      index: 3,
      target: "#joyonestep4",
      type: "step:before",
      content: (
        <p>
          Step 1 is aimed to feed the AI with the sample of data that you want to collect. It should be just several
          rows of data from 2 to 5 rows, not less, not more. You can upload this sample from a CSV file by hitting this
          button
        </p>
      ),
    },
    {
      index: 4,
      target: "#joyonestep5",
      type: "step:before",
      content: (
        <p>
          You can select from predefined templates for HubSpot, LinkedIn, Amazon, ProductHunt, and other sources and
          destinations of data. Templates cover such areas as leads and investors for the CRM, information about
          consumer and IT products, and other things.
        </p>
      ),
    },
  ]

  const [userPlan, setUserPlan] = useState()
  const [userPlanPrice, setUserPlanPrice] = useState()

  const getUserPlan = async () => {
    await api.get(`/user/me`).then((res) => {
      // console.log(res?.data?.subscriptions ,"res?.data?.subscriptions")
      setUserPlan(res?.data?.subscriptions)
      setUserPlanPrice(res.data?.allPlans)
    })
  }
  useEffect(() => {
    getUserPlan()
  }, [])

  //  console.log(userPlanPrice ,"userPlanPrice")
  //  console.log(userPlan ,"userPlan")

  const { list, setListItems, openSideBar, setOpenSideBar, fetchConversions, setFetchConversions } =
    useContext(ListContext)

  const { height, width } = useWindowDimensions()

  const { isLogin, signOut, userDetails, setUserDetails } = useContext(AuthContext)
  const [isOpen, setIsOpen] = React.useState(false)
  const [updateConversion, setupdateConversion] = useState(null)
  const [run, setRun] = useState(false)

  const [loadingTemplate, setLoadingTemplate] = React.useState(null)
  const [param, setParams] = React.useState(null)
  const [firstCheckLocation, setFirstCheckLocation] = React.useState(true)

  //
  const handleButtonClick = (_id) => {
    console.log("DEBUG: handleButtonClick called with id:", _id)
    const queryParams = new URLSearchParams(window.location.search)
    queryParams.delete("id")
    queryParams.append("id", _id)
    const newUrl = "/?" + queryParams.toString()
    console.log("DEBUG: Navigating to:", newUrl)
    navigate(newUrl)
  }

  const location = useLocation()

  const handleButtonClickget = () => {
    const searchParams = new URLSearchParams(location.search)
    const paramValue = searchParams.get("id")
    setParams(paramValue)
  }

  const toggleDrawer = () => {
    setOpenSideBar((prevState) => {
      const newState = !prevState
      localStorage.setItem("openSideBar", JSON.stringify(newState)) // Update localStorage
      return newState
    })
  }
  const [show, setShow] = useState(false)
  const [showPriceModal, setPriceModalShow] = useState(false)
  const [conversions, setConversions] = useState()
  const schema = yup.object().shape({
    name: yup.string().required("Transformation Name."),
    description: yup.string(),
  })
  const readFile = async (temp, id, templateId, additionalData) => {
    const file = new File([temp?.data], "", {
      type: "text/csv",
    })
    const reader = new FileReader()

    reader.onload = async (e) => {
      const bstr = e.target.result
      const workbook = XLSX.read(bstr, { type: "array", raw: true })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      const dupData1 = jsonData?.filter((el) => el?.length > 0)
      const dupData = JSON.parse(JSON.stringify(dupData1))
      if (dupData?.length > 0) {
        const userId = JSON.parse(localStorage.getItem("user"))?._id
        const head = JSON.parse(JSON.stringify(dupData[0]))

        const values = {
          user: userId,
          data: [{ tableHeaders: head, tableData: dupData }],
          csvFileName: temp?.name,
          csvFileSize: temp?.size,
          conversion: id ? id : list,
          sheetDetailsWrite: { empty: "" },
          templateId: templateId,
          ...additionalData,
        }
        try {
          await api.post("/conversion/addData", values).then(async (res) => {
            // Delete the item from localStorage
            localStorage.removeItem("queryParams")

            const queryParams = new URLSearchParams(window.location.search)
            queryParams.delete("id")
            queryParams.append("id", id)
            // navigate('/?' + queryParams.toString());
            // window.location.reload();
            const userId = JSON.parse(localStorage.getItem("user"))?._id

            const res2 = await api.get(`/conversion/all-notes/${userId}`)
            setConversions(res2.data.getAllConversion)
            setListItems(id)
            setSearchList(id)
            handleButtonClick(id)
            fetchEmailSubscriptions(id)
            setLoadingTemplate(false)
          })
        } catch (error) {
          setLoadingTemplate(false)
          localStorage.removeItem("queryParams")

          console.log("Error", error)
        }
      }
    }

    reader.readAsArrayBuffer(file)
  }
  const grabData = (value) => {
    const { Pagination, merge, model, pagination_max_iteractions, processUrls, entireWebsite } = value ?? {}
    return {
      Pagination,
      merge,
      model,
      pagination_max_iteractions,
      processUrls,
      entireWebsite,
    }
  }
  const handleShow = () => {
    //commented because this case is handled on new-conversion screen
    // if (location?.pathname === '/new-conversion') {
    //   navigate('/');
    // }
    setShow(true)
  }
  const handlePriceModalShow = () => setPriceModalShow(true)
  const addTempToConversion = async (res, templateId) => {
    if (res.data?.createConversion?.addTemplate) {
      await readFile(
        res?.data?.createConversion?.addTemplate,
        res.data?.createConversion?._id,
        templateId,
        grabData(res?.data?.createConversion?.addTemplate),
      )
    } else {
      if (res.data?.createConversion) {
        setConversions([...conversions, res.data?.createConversion])
      }
      setListItems(res.data?.createConversion?._id || res?._id)
      setSearchList(res.data?.createConversion?._id || res?._id)
      const queryParams = new URLSearchParams(window.location.search)
      localStorage.removeItem("queryParams")
      queryParams.delete("id")
      queryParams.append("id", res.data?.createConversion?._id || res?._id)
      navigate("/?" + queryParams.toString())
      setLoadingTemplate(false)
      setSelectConversion(false)
    }
  }

  const handleSubmit = async (values, resetForm) => {
    // console.log('Starting handleSubmit with values:', values);
    setLoadingTemplate(true)

    if (conversions && updateConversion === null) {
      // console.log('Creating new conversion');
      const userId = JSON.parse(localStorage.getItem("user"))?._id
      values.user = userId

      const storedQueryParams = localStorage.getItem("queryParams")
      // console.log('Stored query params:', storedQueryParams);
      const tempQuery = new URLSearchParams(storedQueryParams)
      if (storedQueryParams) {
        values.templateId = tempQuery.get("templateid")
        values.url = tempQuery.get("url")
        // console.log('Added template ID and URL from query params:', values);
      }

      const convs = conversions?.filter(
        (conversion) => values.templateId && conversion?.templateId && conversion?.templateId === values.templateId,
      )
      // console.log('Found matching conversions:', convs);

      if (values?.url) {
        // Remove generateUsingAI for URL-based conversions
        delete values.generateUsingAI
        // console.log('Processing URL:', values.url);
        const filename = generateFilenameFromText(values.url) || "text.txt"
        const file = new File([values?.url], filename, {
          type: "text/plain",
        })
        if (convs?.length === 0) {
          setLoad(false)
          // console.log('No matching conversions found, creating new');
          const res = await api.post("/conversion", values)
          // console.log('Created new conversion:', res);
          await addTempToConversion(res, values.templateId)
          await handleUploadFile(file, "0", null, "1", true, true, res.data.createConversion?._id, true, true)
        } else if (convs?.length === 1) {
          // console.log('Found single matching conversion');
          await handleUploadFile(file, "0", null, "1", true, true, convs?.[0]?._id, true, true)
          addTempToConversion(convs?.[0], values.templateId)
        } else {
          setLoad(false)
          // console.log('Multiple matching conversions found:', convs.length);
          setConversionToList(convs)
          setProcessUrlProp(values.url)
          setLoadingTemplate(false)
          setSelectConversion(true)
        }
      } else {
        // console.log('Creating basic conversion');
        // console.log('Using AI generation:', values.generateUsingAI);
        // Keep generateUsingAI only for basic new conversions
        setLoad(true)
        const res = await api.post("/conversion", values)
        setLoad(false)
        // console.log('API response for basic conversion:', res);
        await addTempToConversion(res, values.templateId)
      }
    } else {
      // console.log('Updating existing conversion:', updateConversion._id);
      // Remove generateUsingAI for updates
      delete values.generateUsingAI
      // console.log('Update payload:', values);
      const res = await api.patch(`/conversion/${updateConversion._id}`, values)
      // console.log('Update response:', res);
      handleButtonClick(res.data.data._id)
      setListItems(res.data.data._id)
      setSearchList(res.data.data._id)
      setConversions(
        conversions.map((elem) => {
          if (elem._id == res.data.data._id) {
            return (elem = res.data.data)
          } else {
            return elem
          }
        }),
      )
      setLoadingTemplate(false)
    }
    handleButtonClickget?.()
    setFirstCheckLocation(false)
    resetForm?.()
    handleClose?.()
    setIsAi(false)
    // console.log('Completed handleSubmit');
  }

  // New function to handle creating blank transformation (like "Add blank transformation" button)
  const handleCreateBlankTransformation = async (values, resetForm) => {
    setLoadingTemplate(true)
    setLoad(true)

    try {
      const userId = JSON.parse(localStorage.getItem("user"))?._id

      // First create the conversion
      const conversionValues = {
        user: userId,
        name: values.name,
        description: values.description,
      }

      const res = await api.post("/conversion", conversionValues)
      const newConversionId = res.data.createConversion?._id

      // Then add blank data to it (same as "Add blank transformation" button)
      const blankDataValues = {
        user: userId,
        data: [
          {
            tableHeaders: [[]],
            tableData: [[]],
          },
        ],
        csvFileName: "",
        csvFileSize: "",
        conversion: newConversionId,
        sheetDetailsWrite: { empty: "" },
      }

      await api.post("/conversion/addData", blankDataValues)

      // Update the UI
      console.log("DEBUG: Creating blank transformation, newConversionId:", newConversionId)
      setConversions([...conversions, res.data.createConversion])

      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        setListItems(newConversionId)
        setSearchList(newConversionId)
        console.log("DEBUG: About to call handleButtonClick with:", newConversionId)
        handleButtonClick(newConversionId)
        fetchEmailSubscriptions(newConversionId)
        setFetchConversions(true)
      }, 100)

      setLoad(false)
      setLoadingTemplate(false)
      resetForm?.()
      handleClose?.()
    } catch (error) {
      console.log("Error creating blank transformation:", error)
      setLoad(false)
      setLoadingTemplate(false)
    }
  }

  const openConversionModal = catchAsync(async (user) => {
    setupdateConversion(user)
    setShow(true)
  })

  const handleClose = () => {
    setupdateConversion(null)
    setShow(false)
    // Reset template selection when modal closes
    setSelectedTemplate("")
    setTemplateFilter("")
  }

  const handlePriceModalClose = () => {
    setPriceModalShow(false)
    setOpenPlan?.(false)
  }

  const getAllConversions = catchAsync(async () => {
    const userId = JSON.parse(localStorage.getItem("user"))?._id
    const res = await api.get(`/conversion/all-notes/${userId}`)
    // console.log(res.data)
    setConversions(res.data.getAllConversion)
    if (!userDetails?.defaultAdded) {
      api.get("/user/userDetails").then(async (res2) => {
        localStorage.setItem("user", JSON.stringify(res2?.data))
        setUserDetails(res2?.data)
      })
    }
    setLoadingTemplate(false)
  })
  const handleNewConversionTemplate = () => {
    // Retrieve query parameters from localStorage
    const storedQueryParams = localStorage.getItem("queryParams")
    if (storedQueryParams) {
      handleSubmit?.({})
    }
  }

  const [first, setfirst] = useState(true)
  useEffect(() => {
    handleButtonClickget()
    getAllConversions()
    setListItems("")
    setTimeout(() => {
      setRun(true)
    }, "1000")
    if (sessionStorage.getItem("new-conversion") == "true") {
      sessionStorage.setItem("new-conversion", false)
      handleShow()
    }
  }, [])
  useEffect(() => {
    if (conversions && runOnce) {
      setRunOnce(false)
      handleNewConversionTemplate()
    }
  }, [conversions])

  useLayoutEffect(() => {
    if (location?.pathname === "/logout") {
      window.location.reload()
      Logout()
    }
  }, [location])
  useEffect(() => {
    if (conversions?.length === 0 && userDetails?.defaultAdded) {
      handleShow()
    }
  }, [conversions, userDetails])

  useEffect(() => {
    if (param !== null && conversions?.length > 0 && firstCheckLocation) {
      const queryParams = new URLSearchParams(window.location.search)
      if (queryParams.get("showPlans")) {
        setPriceModalShow(true)
      }
      const find = conversions?.find((val) => val?._id === param)

      if (find) {
        setListItems(param)
      } else if (find === undefined && param !== "") {
        setListItems("noPer")
      } else if (find === undefined && param === null && conversions?.length > 0) {
        setListItems(conversions[0]._id)
        setSearchList(conversions[0]._id)
      }
    }
    // else if (param !== null && conversions?.length === 0) {
    //   setListItems("noPer");
    else if (param === null && conversions?.length > 0 && first) {
      setListItems(conversions[0]._id)
      setSearchList(conversions[0]._id)
      const queryParams = new URLSearchParams(window.location.search)
      if (queryParams.get("showPlans")) {
        setPriceModalShow(true)
      }
      queryParams.delete("id")
      queryParams.append("id", conversions[0]._id)
      setfirst(false)
      // if (location?.pathname !== '/profile') {
      //   navigate('/?' + queryParams.toString());
      // }
    }
  }, [param, conversions, firstCheckLocation])

  useEffect(() => {
    if (fetchConversions) {
      getAllConversions()
      setFetchConversions(false)
    }
  }, [fetchConversions])

  const deleteConversions = catchAsync(async (id) => {
    try {
      const res = await api.delete(`/conversion/${id}`)

      // Only update UI state if deletion was successful
      const currCons = JSON.parse(localStorage.getItem("currentConverstion"))
      if (currCons === id) {
        localStorage.removeItem("currentConverstion")
        setListItems(null)
      }

      // Make sure conversions is defined before filtering
      if (conversions && Array.isArray(conversions)) {
        const data = conversions.filter((elem) => {
          return elem._id !== id
        })

        setConversions(data)

        if (data.length === 0) {
          const queryParams = new URLSearchParams(window.location.search)
          queryParams.delete("id")
          navigate("/?" + queryParams.toString())
        } else if (data.length > 0) {
          handleButtonClick(data[0]._id)
          setListItems(data[0]._id)
          setSearchList(data[0]._id)
        }

        setFirstCheckLocation(false)
      }

      return res
    } catch (error) {
      console.error("Error deleting conversion:", error)
      throw error // Let catchAsync handle the error
    }
  })

  const Logout = () => {
    window.location.reload()
    signOut()
    navigate("/signin")
  }

  const email = JSON.parse(localStorage.getItem("user"))?.email
  const ellipsisRef = useRef(null)

  const handleClickOutside = (event) => {
    if (event.target.className.baseVal !== "dotsIcon") {
      setDropDownValue(false)
    }
  }

  const updatePosition = () => {
    setDropDownValue(null)
  }

  useEffect(() => {
    if (notesRef.current) notesRef.current.addEventListener("scroll", updatePosition)
    return () => {
      if (notesRef.current) notesRef.current.removeEventListener("scroll", updatePosition)
    }
  }, [notesRef])

  useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])
  const { userPlan: subscriptionPlan } = useContext(PlansContext)

  const [emailSubscriptions, setEmailSubscriptions] = useState([])
  const fetchEmailSubscriptions = async (id) => {
    localStorage.setItem("convClick", "click")
    const res = await api.get(`/conversion/subscription/${id}`)
    setEmailSubscriptions(res.data?.data?.emailSubscription)
    localStorage.setItem("convClick", "noClick")
  }

  const toggleEmailSubscription = async (id) => {
    const res = await api.patch(`/conversion/subscribeEmail/${id}`)
    setEmailSubscriptions(res.data?.data?.emailSubscription)
  }
  const filteredConversions = conversions?.filter((elem) => elem?.name?.toLowerCase().includes(searchQuery))
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

  /* Subscriptions Plans */
  const [subscriptionsPlans, setSubscriptionsPlans] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const result = await getSubscriptionsPlans()
      if (result) {
        result.push(plans[2])
        setSubscriptionsPlans(result)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getSubscriptionsPlans = async () => {
    try {
      // Fetch both subscription plans and user data in parallel
      const [response, userPlan] = await Promise.all([api.get("/subscription/plans"), api.get("/user/me")])

      // Check if userPlan data is available and handle the filtering accordingly
      const filteredData = response?.data.filter((plan) => plan.name !== "TRIAL")
      const filteredDataFree = response?.data.filter((plan) => plan.name !== "FREE")

      // Perform filtering based on the user's subscription plan
      const plansToReturn = userPlan?.data?.subscriptions?.[0]?.name === "TRIAL" ? filteredDataFree : filteredData

      // Return the converted plans after filtering
      return getConvertedPlans(plansToReturn)
    } catch (err) {
      console.log("Error:", err)
    }
  }

  useEffect(() => {
    // Trigger the getSubscriptionsPlans function when the component mounts
    getSubscriptionsPlans()
  }, [])

  const [isAi, setIsAi] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const fileInputRef = useRef(null)
  const subscriptionsPrice = userPlanPrice?.map((plan) => plan?.subscriptionType?.price)

  // File upload validation
  const validateFile = (file) => {
    const allowedTypes = {
      // Images
      "image/jpeg": true,
      "image/png": true,
      "image/gif": true,
      "image/webp": true,
      "image/svg+xml": true,
      // Documents
      "application/pdf": true,
      // Data formats
      "text/csv": true,
      "text/html": true,
      "application/json": true,
      "application/xml": true,
      "text/xml": true,
      // Spreadsheet formats
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true, // .xlsx
      "application/vnd.ms-excel": true, // .xls
    }

    // Check file type
    if (!allowedTypes[file.type]) {
      toast.error(t("fileUpload.invalidFileType"))
      return false
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      toast.error(t("fileUpload.fileTooLarge"))
      return false
    }

    return true
  }

  // Handle file upload
  const handleFileUpload = async (file, formik) => {
    if (!file || !validateFile(file)) return

    setFileUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // setLoad(true)
      const res = await api.post("/conversion/generate-description", formData)
      // setLoad(false)

      const data = (await res?.data?.description) || ""
      // console.log('data', data);

      if (data) {
        // Append the returned description to existing text
        const currentDesc = formik.values.description || ""
        // console.log('currentDesc', currentDesc);

        const newDesc = currentDesc ? `${currentDesc}\n\n${data}` : data
        // console.log('newDesc', newDesc);

        formik.setFieldValue("description", newDesc)
        toast.success(t("transformationModal.fileUpload.success"))
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      // Improve error message to be more specific
      let errorMessage = t("transformationModal.fileUpload.error")
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 404) {
          errorMessage = t("transformationModal.fileUpload.endpointNotFound") || "Endpoint not found"
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = t("transformationModal.fileUpload.noResponse") || "No response from server"
      }
      toast.error(errorMessage)
    } finally {
      setFileUploading(false)
    }
  }

  // Handle file input change
  const handleFileInputChange = (event, formik) => {
    const file = event.target.files[0]
    if (file) {
      handleFileUpload(file, formik)
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1030
      setIsMobile(mobile)
      if (mobile) {
        onCollapsedChange(true)
      } else {
        onCollapsedChange(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [onCollapsedChange])
  return (
    <>
  {isMobile  && (
  <div
    style={{
      // position: "fixed",
      // top: 0,
      // left: 0,
      // right: 0,
      // bottom: 0,
      // zIndex: 40,
      // backgroundColor: "rgba(0, 0, 0, 0.6)",
      // backdropFilter: "blur(4px)",
      // display: "block", // ensures it shows on mobile
    }}
    onClick={() => onCollapsedChange(true)}
  />
)}

      <aside
       style={{
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: isCollapsed ? "60px" : "280px", // ✅ pure CSS, not Tailwind
  backgroundColor: "#2D3748",
  color: "white",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #4A5568",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  transition: "all 0.3s ease",
  zIndex: 50,
  transform:
    isCollapsed && isMobile
      ? "translateX(-100%)"
      : "translateX(0)", // ✅ CSS transform instead of Tailwind translate-x
}}

      >{!isMobile && (
          <button
            onClick={() => onCollapsedChange((c) => !c)}
            className="absolute top-6 -right-3 z-20 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full shadow-lg p-1.5 border border-slate-700 transition-all duration-200 hover:scale-105"
            style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
         {isMobile && !isCollapsed && (
    <button
      onClick={() => onCollapsedChange(true)} // ✅ collapse on close
      className="absolute top-2 right-4 z-20 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full shadow-lg p-2 border border-slate-700 transition-all duration-200 hover:scale-105"
      aria-label="Close sidebar"
    >
      <X size={18} /> {/* use lucide-react X icon */}
    </button>
  )}
        {/* <Button
          variant="ghost"
          size="sm"
          style={{
            position: "absolute",
            right: "8px",
            top: "8px",
            color: "white",
            backgroundColor: "transparent",
            border: "none",
          }}
          onClick={toggleDrawer}
        >
          {openSideBar ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button> */}

        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
         { !isCollapsed && <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "16px",
              marginBottom: "16px",
              padding: "0 16px",
            }}
          >
            {/* <Avatar style={{ width: "40px", height: "40px", marginBottom: "8px" }}>
              <AvatarImage src={userDetails?.photo || "/placeholder.svg"} />
              <AvatarFallback style={{ backgroundColor: "#6366F1", color: "white" }}>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar> */}
            {(width < 722 || !isCollapsed) && (
              <div
                style={{
                  fontSize: "14px",
                  color: "#E2E8F0",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {email}
              </div>
            )}
          </div>
}
          {!isCollapsed && (
            <Button
              id="newstepone"
              style={{
                backgroundColor: "#22C55E",
                color: "white",
                margin: "0 16px 16px 16px",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={handleShow}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("sidebar.newTransformation")}
            </Button>
          )}

          {(!isCollapsed ) && search && (
            <div style={{ padding: "0 16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "14px", color: "#94A3B8" }}>
                {search.remainingUploads !== null && search.totalUploads !== null && (
                  <span className="step-2">
                    {t("home.remaining")} {search?.remainingUploads} of {search?.totalUploads}
                  </span>
                )}
              </div>
            </div>
          )}

          {(!isCollapsed ) && (
            <div style={{ padding: "0 24px", marginBottom: "12px" }}>
              <div style={{ position: "relative" }}>
                {/* Search Icon */}
                <div
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none", // so clicks go to input
                  }}
                >
                  {/* <Search
          style={{
            color: "#94A3B8", // slate-400
            width: "18px",
            height: "18px",
          }}
        /> */}
                </div>

                {/* Input Field */}
                <Input
                  type="text"
                  placeholder="Search ..."
                  value={searchQuery}
                  onChange={handleSearch}
                  style={{
                    width: "100%",
                    backgroundColor: "#1E293B", // slate-800
                    color: "white",
                    border: "1px solid #334155", // slate-700
                    borderRadius: "8px",
                    paddingLeft: "44px", // leave space for icon
                    paddingRight: "12px",
                    height: "44px", // h-11
                    lineHeight: "44px",
                    transition: "all 0.2s ease-in-out",
                  }}
                />
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 px-2">
            {loadingTemplate ? (
              <div className="flex h-full justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div style={{ padding: "0 8px" }}>
                {!loadingTemplate && filteredConversions?.length > 0 ? (
                  filteredConversions.map((elem, index) => {
                    const trimmedString = elem?.name ? elem.name.substr(0, 16) : ""

                    return (
                      <div
                        key={elem._id}
                        style={{
                          position: "relative",
                          borderRadius: "8px",
                          padding: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          backgroundColor: (list || searchList) === elem?._id ? "#4A5568" : "transparent",
                          color: (list || searchList) === elem?._id ? "white" : "#CBD5E0",
                          marginBottom: "4px",
                        }}
                        onMouseEnter={(e) => {
                          if ((list || searchList) !== elem?._id) {
                            e.currentTarget.style.backgroundColor = "#374151"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((list || searchList) !== elem?._id) {
                            e.currentTarget.style.backgroundColor = "transparent"
                          }
                        }}
                        onClick={() => {
                          setListItems(elem?._id)
                          setSearchList(elem?._id)
                          handleButtonClick(elem?._id)
                          fetchEmailSubscriptions(elem?._id)
                        }}
                      >
                       

                        {/* Fixed dropdown menu positioning and styling for better visibility */}
                    {dropDownValue === elem?._id ? (
  <div
     className="menu-responsive fixed z-[9999] w-56 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 animate-fade-in backdrop-blur-sm"
  style={{
    top: dropdownPosition?.top ?? 100,   // dynamic position
    left: dropdownPosition?.left ?? 100, // dynamic position
    padding: "8px 0",
  }}
  
  >
    {/* Edit Name & Description */}
    <div
      onClick={() => openConversionModal(elem)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        cursor: 'pointer',
        color: '#c9d1d9',
        fontSize: '14px',
      }}
    >
      <span>{t('actions.nameAndDescription')}</span>
      <AiOutlineEdit style={{ fontSize: '16px' }} />
    </div>

    {/* Copy Without Data */}
    <div
      onClick={async () => {
        if (dataPresentCheck === 'data present') {
          let userId = JSON.parse(localStorage.getItem('user'))?._id;
          let res2 = await api.get(`/conversion/getData/${elem?._id}`);
          const newArray = res2?.data?.data[0]?.tableHeaders?.slice(2);
          const data2 = res2?.data?.data;
          if (data2?.length) {
            data2[0].tableHeaders = newArray;
            data2[0].tableData.forEach((val, i) => {
              const newArray2 = val.slice(2);
              data2[0].tableData[i] = newArray2;
            });
            data2[0].tableData.unshift(newArray);
            let res = await api.post('/conversion', {
              user: userId,
              name: `Copy - ${elem?.name}`,
              description: elem?.description,
            });
            let values = {
              user: userId,
              data: data2,
              csvFileName: res2?.data?.csvFileName,
              csvFileSize: res2?.data?.csvFileSize,
              conversion: res?.data?.createConversion?._id,
              sheetDetailsWrite: { empty: '' },
            };
            try {
              api.post('/conversion/addData', values).then(() => {
                getAllConversions();
              });
            } catch (error) {
              console.log('Error', error);
            }
          }
        }
      }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 16px',
        cursor: dataPresentCheck === 'data present' ? 'pointer' : 'not-allowed',
        color: dataPresentCheck === 'data present' ? '#c9d1d9' : '#6e7681',
        fontSize: '14px',
        opacity: dataPresentCheck === 'data present' ? 1 : 0.6,
      }}
    >
      <span>{t('actions.copyWithoutData')}</span>
      <AiOutlineCopy style={{ fontSize: '16px' }} />
    </div>

    {/* Copy With Data */}
    <div
      onClick={async () => {
        if (dataPresentCheck === 'data present') {
          let userId = JSON.parse(localStorage.getItem('user'))?._id;
          let res = await api.post('/conversion', {
            user: userId,
            name: `Copy - ${elem?.name}`,
            description: elem?.description,
          });
          let values = {
            conversionToCopyId: elem?._id,
            userId: userId,
            newConversionId: res?.data?.createConversion?._id,
          };
          try {
            api.post('/conversion/addDataByConversionId', values).then(() => {
              getAllConversions();
            });
          } catch (error) {
            console.log('Error', error);
          }
        }
      }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        cursor: dataPresentCheck === 'data present' ? 'pointer' : 'not-allowed',
        color: dataPresentCheck === 'data present' ? '#c9d1d9' : '#6e7681',
        fontSize: '14px',
        opacity: dataPresentCheck === 'data present' ? 1 : 0.6,
      }}
    >
      <span>{t('actions.copyWithData')}</span>
      <AiOutlineCopy style={{ fontSize: '16px' }} />
    </div>

    {/* Subscribe / Unsubscribe */}
    <div
      onClick={() => dataPresentCheck === 'data present' && toggleEmailSubscription(elem._id)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        cursor: dataPresentCheck === 'data present' ? 'pointer' : 'not-allowed',
        color:
          dataPresentCheck === 'data present'
            ? emailSubscriptions
              ? '#d29922' // orange for unsubscribe
              : '#238636' // green for subscribe
            : '#6e7681',
        fontSize: '14px',
        opacity: dataPresentCheck === 'data present' ? 1 : 0.6,
      }}
    >
      <>
        <span>
          {emailSubscriptions ? t('actions.unsubscribe') : t('actions.subscribe')}
        </span>
        {emailSubscriptions ? (
          <HiOutlineBellSlash style={{ fontSize: '16px', color: '#d29922' }} />
        ) : (
          <HiOutlineBellAlert style={{ fontSize: '16px', color: '#238636' }} />
        )}
      </>
    </div>

    {/* Delete */}
    <div
      onClick={() => deleteConversions(elem._id)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        marginTop: '8px',
        cursor: 'pointer',
        color: '#f85149',
        fontSize: '14px',
      }}
    >
      <span>{t('actions.delete')}</span>
      <AiOutlineDelete style={{ fontSize: '16px', color: '#f85149' }} />
    </div>
  </div>
) : null}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                            {isCollapsed ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                    <Globe style={{ width: "16px", height: "16px", color: "#94A3B8", flexShrink: 0 }} />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p style={{ marginBottom: "0px" }}>{extractDateFromString(elem.name)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Globe style={{ width: "16px", height: "16px", color: "#94A3B8", flexShrink: 0 }} />
                            )}

                            {!isCollapsed ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        minWidth: 0,
                                        flex: 1,
                                      }}
                                    >
                                      {trimmedString.length >= 17 ? `${trimmedString}...` : trimmedString}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p style={{ marginBottom: "0px" }}>{elem.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                {elem.name}
                              </span>
                            )}
                          </div>

                          {(!isCollapsed) && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                // opacity: 0,
                                transition: "opacity 0.2s ease",
                              }}
                              className="group-hover:opacity-100"
                            >
                              {index + 1 !== conversions?.length && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    padding: 0,
                                    color: "#94A3B8",
                                    backgroundColor: "transparent",
                                    border: "none",
                                  }}
                                  onClick={async () => {
                                    setParams(conversions[index]?._id);
                                    const body = {
                                      id1: conversions[index]?._id,
                                      sequence_value1:
                                        conversions[index]?.sequence_value,
                                      id2: conversions[index + 1]?._id,
                                      sequence_value2:
                                        conversions[index + 1]?.sequence_value,
                                    };
                                    setLoadingTemplate(true);
                                    await api.post(
                                      '/conversion/changeOrderOfConversion',
                                      body,
                                    );
                                    getAllConversions();
                                  }}
                                >
                                  <AiOutlineArrowDown className="h-3 w-3" />
                                </Button>
                              )}
                              {index !== 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    padding: 0,
                                    color: "#94A3B8",
                                    backgroundColor: "transparent",
                                    border: "none",
                                  }}
                                    onClick={async () => {
                                    setParams(conversions[index]?._id);

                                    const body = {
                                      id1: conversions[index]?._id,
                                      sequence_value1:
                                        conversions[index]?.sequence_value,
                                      id2: conversions[index - 1]?._id,
                                      sequence_value2:
                                        conversions[index - 1]?.sequence_value,
                                    };
                                    setLoadingTemplate(true);

                                    await api.post(
                                      '/conversion/changeOrderOfConversion',
                                      body,
                                    );
                                    getAllConversions();
                                  }}
                                >
                                  <AiOutlineArrowUp className="h-3 w-3" />
                                </Button>
                              )}
                              {/* Improved three-dot button styling and positioning */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                 onClick={async (e) => {
                                    e.stopPropagation(); // Add this line
                                  let res = await api.get(
                                    `/conversion/checkDataExist/${elem._id}`,
                                  );
                                  const position =
                                    e.target.getBoundingClientRect();
                                  setDropdownPosition(position);
                                  setDataPresentCheck(res?.data?.data);
                                  setDropDownValue(
                                    dropDownValue === elem._id ? null : elem._id,
                                  );
                                }}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ textAlign: "center", color: "#94A3B8", padding: "32px 0" }}>{t("sidebar.noData")}</div>
                )}
              </div>
            )}
          </ScrollArea>

          <div style={{ marginTop: "auto", padding: isCollapsed?"4px": "16px", borderTop: "1px solid #4A5568", }}>
            <Button
              variant="ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                color: "#CBD5E0",
                backgroundColor: "transparent",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
              }}
              // onClick={handlePriceModalShow}
            >
              <Star style={{ width: "16px", height: "16px", marginRight: "8px", color: "#F59E0B" }} />
              {(!isCollapsed) && (
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {subscriptionPlan?.[subscriptionPlan?.length - 1]?.name === "FREE"
                    ? t("sidebar.upgrade")
                    : t("sidebar.subscription")}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                color: "#CBD5E0",
                backgroundColor: "transparent",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => navigate("/")}
            >
              <User style={{ width: "16px", height: "16px", marginRight: "8px" }} />
              {(!isCollapsed) && (
                <span style={{ fontSize: "14px", fontWeight: "500" }}>{t("sidebar.profile")}</span>
              )}
            </Button>

            <LanguageSwitcher />

            <Button
              variant="ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                color: "#CBD5E0",
                backgroundColor: "transparent",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => navigate("/")}
            >
              <Settings style={{ width: "16px", height: "16px", marginRight: "8px" }} />
              {(!isCollapsed) && (
                <span style={{ fontSize: "14px", fontWeight: "500" }}>{t("sidebar.integrations")}</span>
              )}
            </Button>

            <Button
              variant="ghost"
              style={{
                width: "100%",
                justifyContent: "flex-start",
                color: "#CBD5E0",
                backgroundColor: "transparent",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={Logout}
            >
              <LogOut style={{ width: "16px", height: "16px", marginRight: "8px" }} />
              {(!isCollapsed) && (
                <span style={{ fontSize: "14px", fontWeight: "500" }}>{t("sidebar.logout")}</span>
              )}
            </Button>
          </div>
        </div>
      </aside>
      {/* Custom Modal for Pricing */}
      {showPriceModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-hidden">
            <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
              <button
                onClick={handlePriceModalClose}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t("account.yourPlan")}</h2>
                </div>
              </div>
            </div>
        
          </div>
        </div>
      )}

      {/* Custom Modal for Loading */}
      {load && show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-hidden">
            <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {t(`transformation.editOrAdd.${updateConversion ? "edit" : "add"}`)}
                  </h2>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <div>
                  {isAi ? "AI " : ""}
                  {t("account.generating")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        {!load && show && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              padding: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                width: "100%",
                maxWidth: "672px",
                position: "relative",
                animation: "fadeIn 0.3s ease-out",
                maxHeight: "90vh",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "relative",
                  background: "linear-gradient(to right, #ecfdf5, #f0fdfa)",
                  padding: "16px 24px",
                  borderBottom: "1px solid #a7f3d0",
                }}
              >
                <button
                  onClick={handleClose}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    padding: "6px",
                    color: "#9ca3af",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#4b5563"
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.5)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#9ca3af"
                    e.target.style.backgroundColor = "transparent"
                  }}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      padding: "6px",
                      backgroundColor: "#d1fae5",
                      borderRadius: "8px",
                    }}
                  >
                    <Sparkles
                      style={{
                        width: "20px",
                        height: "20px",
                        color: "#059669",
                      }}
                    />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#111827",
                        margin: 0,
                      }}
                    >
{             updateConversion?"Edit Transformation":         "Create New Transformation"
}                    </h2>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#4b5563",
                        margin: 0,
                      }}
                    >
                      Set up a new data transformation
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "20px 24px",
                  overflowY: "auto",
                  maxHeight: "calc(90vh - 120px)",
                }}
              >
                <Formik
                  onSubmit={(values, { resetForm }) => {
                    handleSubmit(values, resetForm)
                  }}
                  enableReinitialize
                  initialValues={{
                    name: updateConversion?.name || "",
                    description: updateConversion?.description || "",
                  }}
                >
                  {(formik) => (
                    <form
                      onSubmit={formik.handleSubmit}
                      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                    >
                      <div>
                        <Label htmlFor="name">Transformation Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Conference Attendees"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border:
                              formik.touched.name && formik.errors?.name ? "1px solid #ef4444" : "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.2s",
                          }}
                        />
                        {formik.touched.name && formik.errors?.name && (
                          <p
                            style={{
                              color: "#ef4444",
                              fontSize: "14px",
                              marginTop: "4px",
                              margin: "4px 0 0 0",
                            }}
                          >
                            {formik.errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Description example: This transformation is used to collect a list of contacts of speakers and attendees of the conferences including persons' name, position, company name, email, LinkedIn profile, X (Twitter) profile, and the conference name and website."
                          value={formik.values.description}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          style={{
                            width: "100%",
                            minHeight: "120px",
                            padding: "8px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            resize: "none",
                            outline: "none",
                            fontFamily: "inherit",
                          }}
                        />
                      </div>

                      {!updateConversion && (
                        <div>
                          <Label>Template</Label>
                          <div style={{ marginTop: "4px" }}>
                            <select
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: "white",
                                color: "#374151",
                                fontSize: "14px",
                                outline: "none",
                                cursor: "pointer",
                              }}
                              value={selectedTemplate}
                              onChange={(e) => setSelectedTemplate(e.target.value)}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#059669"
                                e.target.style.boxShadow = "0 0 0 2px rgba(5, 150, 105, 0.2)"
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#d1d5db"
                                e.target.style.boxShadow = "none"
                              }}
                            >
                              <option value="">Select a template</option>
                              {filteredTemplates.map((template) => (
                                <option key={template.id} value={template.id}>
                                  {template.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                    { !updateConversion && <div
                        style={{
                          display: "flex",
    flexWrap: "wrap", // ✅ allow wrapping
    gap: "12px",
    paddingTop: "8px",
                        }}
                      >
                        <Button
            
                          type="button"
                          variant="outline"
                          style={{
                            flex: "1 1 30%", // 3 buttons in one line on large
      minWidth: "200px", // prevents buttons from shrinking too much
                            backgroundColor: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            color: "#4b5563",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: formik.values.name ? "pointer" : "not-allowed",
                            opacity: formik.values.name ? 1 : 0.5,
                          }}
                          disabled={!formik.values.name}
                          onClick={() => {
                            if (updateConversion) {
                              formik.handleSubmit()
                            } else {
                              if (formik.values.name) {
                                handleCreateBlankTransformation(formik.values, () => formik.resetForm())
                              }
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (formik.values.name) {
                              e.target.style.backgroundColor = "#f3f4f6"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (formik.values.name) {
                              e.target.style.backgroundColor = "#f9fafb"
                            }
                          }}
                        >
                          <Sparkles style={{ height: "16px", width: "16px", marginRight: "8px" }} />
                          Create Using AI
                        </Button>

                        <Button
                          type="button"
                          style={{
                            flex: "1 1 30%", // 3 buttons in one line on large
      minWidth: "200px", // prevents buttons from shrinking too much
                            backgroundColor: "#16a34a",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: fileUploading ? "not-allowed" : "pointer",
                            opacity: fileUploading ? 0.7 : 1,
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={fileUploading}
                          onMouseEnter={(e) => {
                            if (!fileUploading) {
                              e.target.style.backgroundColor = "#15803d"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!fileUploading) {
                              e.target.style.backgroundColor = "#16a34a"
                            }
                          }}
                        >
                          {fileUploading ? (
                            <>
                              <Loader2
                                style={{ height: "16px", width: "16px", marginRight: "8px" }}
                                className="animate-spin"
                              />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload style={{ height: "16px", width: "16px", marginRight: "8px" }} />
                              Upload Sample File
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          style={{
                            flex: "1 1 30%", // 3 buttons in one line on large
      minWidth: "200px", // prevents buttons from shrinking too much
                            backgroundColor: "#dcfce7",
                            color: "#15803d",
                            border: "1px solid #bbf7d0",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: formik.values.name ? "pointer" : "not-allowed",
                            opacity: formik.values.name ? 1 : 0.5,
                          }}
                          disabled={!formik.values.name}
                          onClick={async () => {
                            if (!formik.values.name) return
                            const valuesWithAI = {
                              ...formik.values,
                              generateUsingAI: true,
                            }
                            setIsAi(true)
                            await handleSubmit(valuesWithAI, () => formik.resetForm())
                          }}
                          onMouseEnter={(e) => {
                            if (formik.values.name) {
                              e.target.style.backgroundColor = "#bbf7d0"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (formik.values.name) {
                              e.target.style.backgroundColor = "#dcfce7"
                            }
                          }}
                        >
                          Create from Scratch
                        </Button>
                      </div>}

                  {
  updateConversion && (
    <div
      style={{
        display: "flex",
        gap: "12px",
        paddingTop: "8px",
      }}
    >
      <Button
        type="button"
        variant="outline"
        style={{
          backgroundColor: "#d1fae5", // light green
          border: "1px solid #a7f3d0", // slightly darker green border
          color: "#059669", // dark green text
          padding: "8px 16px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: formik.values.name ? "pointer" : "not-allowed",
          opacity: formik.values.name ? 1 : 0.5,
          transition: "background-color 0.2s ease",
        }}
        disabled={!formik.values.name}
        onClick={() => {
          if (updateConversion) {
            formik.handleSubmit();
          } else {
            if (formik.values.name) {
              handleCreateBlankTransformation(formik.values, () => formik.resetForm());
            }
          }
        }}
        onMouseEnter={(e) => {
          if (formik.values.name) {
            e.target.style.backgroundColor = "#a7f3d0"; // hover color
          }
        }}
        onMouseLeave={(e) => {
          if (formik.values.name) {
            e.target.style.backgroundColor = "#d1fae5"; // default
          }
        }}
      >
        {updateConversion
          ? t("transformation.form.saveOrCreate.save")
          : t("transformation.form.saveOrCreate.createBlank")}
      </Button>
    </div>
  )
}


                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileInputChange(e, formik)}
                        accept=".jpg,.jpeg,.png,.webp,.svg,.pdf,.csv,.html,.json,.xml,.xbrl,.xlsx"
                      />
                    </form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Custom Modal for Select Conversion */}
      {selectConversion && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-hidden">
            <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
              <button
                onClick={() => setSelectConversion(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Select Conversion to add link</h2>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <Select
                  options={[
                    { value: "", label: "Select" },
                    ...conversionToList?.map((cL) => ({
                      value: cL?._id,
                      label: cL?.name,
                    })),
                  ]}
                  onChange={(e) => setSelectedConversion(e)}
                  values={selectedConversion}
                  placeholder="Select a conversion"
                />
                <Button
                  disabled={!selectedConversion?.[0]?.value || loadingTemplate}
                  onClick={async () => {
                    setLoadingTemplate(true)
                    const filename = generateFilenameFromText(processUrlProp) || "text.txt"
                    const file = new File([processUrlProp], filename, {
                      type: "text/plain",
                    })
                    await handleUploadFile(file, "0", null, "1", true, true, selectedConversion?.[0]?.value, true, true)
                    addTempToConversion(
                      conversionToList?.find((cTL) => cTL?._id === selectedConversion?.[0]?.value),
                      selectedConversion?.[0]?.value,
                    )
                    setLoadingTemplate(false)
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
