"use client"

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, ChevronUp, ChevronDown, Settings, Edit, Trash2, Plus, MoreHorizontal } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function ModernDataTable({
  initialColumns = [],
  initialAttributes = [],
  initialData = [],
  pushColumn,
  showSampleData,
  deleteColumn,
  editColumn,
  addRow,
  deleteRow,
  updateRow,
  isCollapsed,
}) {
  // const { toast } = useToast()

  const [data, setData] = useState({
    columns: [],
    attributes: [],
    data: [],
  })
  const [columns, setColumns] = useState([])
  const [sorting, setSorting] = useState([])
  const [connectedClassifier, setConnectedClassifier] = useState([])
  const [fileName, setFileName] = useState("")
  const [selectedColumn, setSelectedColumn] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState([])
  const [newRowData, setNewRowData] = useState([])
  const [showNewRowModal, setShowNewRowModal] = useState(false)
  const [editingColumnIndex, setEditingColumnIndex] = useState(null)
  const [newColumnIndex, setNewColumnIndex] = useState(null)
  const [editedColumn, setEditedColumn] = useState(null)
  const [showAddColumnModal, setShowAddColumnModal] = useState(false)
  const [newColumnHeader, setNewColumnHeaders] = useState([])
  const [newColumnData, setNewColumnData] = useState({
    name: "",
    datatype: "text",
    description: "",
    unique: false,
    mandatory: false,
    computeField: false,
    search: false,
    columnName: "",
  })
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [addColumnPosition, setAddColumnPosition] = useState(null)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [recordToDeleteIsSample, setRecordToDeleteIsSample] = useState(null)
  const [isSample, setIsSample] = useState("")
  const [editingRowIndex, setEditingRowIndex] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (data?.columns?.length) {
      setNewRowData(data.columns.map(() => ""))

      const newColumns = [
        ...data.columns.map((column, index) => ({
          accessorFn: (row) => row[index],
          id: column || `column_${index}`,
          header: column || `Column ${index}`,
          cell: (info) => {
            const value = info.getValue()
            // Handle URL rendering
            if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) {
              return (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "rgb(37 99 235)",
                    textDecoration: "none",
                    transition: "color 0.15s ease-in-out",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "rgb(30 64 175)"
                    e.target.style.textDecoration = "underline"
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "rgb(37 99 235)"
                    e.target.style.textDecoration = "none"
                  }}
                >
                  {value}
                </a>
              )
            }
            return <span style={{ lineHeight: "1.625" }}>{value}</span>
          },
        })),
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <DropdownMenu style={{ background: "white" }}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" style={{ height: "2rem", width: "2rem", padding: 0 }}>
                  <MoreHorizontal style={{ height: "1rem", width: "1rem" }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ background: "white" }}>
                <DropdownMenuItem
                  onClick={() => {
                    handleEditRow(row.index)
                    setIsSample(row.original.isSample)
                  }}
                >
                  <Edit style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!showSampleData) {
                      deleteRow(row.original, [row.index], "", "con")
                    } else {
                      deleteRow(row.original, [row.index], "csv", "samp")
                    }
                    setShowDeleteConfirmModal(false)
                  }}
                  style={{ color: "rgb(220 38 38)" }}
                >
                  <Trash2 style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        },
      ]
      setColumns(newColumns)
    }
  }, [data])

  useEffect(() => {
    const safeInitialColumns = Array.isArray(initialColumns) ? initialColumns : []
    const safeInitialAttributes = Array.isArray(initialAttributes) ? initialAttributes : []
    const safeInitialData = Array.isArray(initialData) ? initialData : []

    // Set data with safe arrays
    setData({
      columns: safeInitialColumns.length >= 2 ? safeInitialColumns : ["FileName", "Date/Time", ...safeInitialColumns],
      attributes: safeInitialAttributes.length >= 2 ? safeInitialAttributes : [null, null, ...safeInitialAttributes],
      data: safeInitialData,
    })

    // Set new row data with safe arrays
    const columnsForNewRow =
      safeInitialColumns.length >= 2 ? safeInitialColumns : ["FileName", "Date/Time", ...safeInitialColumns]

    setNewRowData(columnsForNewRow.map(() => ""))
  }, [initialColumns, initialAttributes, initialData])

  // ... existing code for all the functions ...

  const addColumn = async () => {
    if (newColumnData.name && !data.columns.includes(newColumnData.name)) {
      const currentIndex = newColumnIndex

      let newColumnIdx
      if (currentIndex === null) {
        newColumnIdx = data.columns.length
      } else {
        if (addColumnPosition === "left") {
          newColumnIdx = Math.max(1, currentIndex)
        } else {
          newColumnIdx = currentIndex + 1
        }
      }

      const newColumns = [
        ...data.columns.slice(0, newColumnIdx),
        newColumnData.name,
        ...data.columns.slice(newColumnIdx),
      ]

      const newAttributes = [
        ...data.attributes.slice(0, newColumnIdx),
        {
          _id: Math.random().toString(36).substr(2, 9),
          title: newColumnData.name,
          description: newColumnData.description,
          unique: newColumnData.unique,
          mandatory: newColumnData.mandatory,
          computeField: newColumnData.computeField,
          datatype: newColumnData.datatype,
          search: newColumnData.search,
        },
        ...data.attributes.slice(newColumnIdx),
      ]

      const newData = data.data.map((row) => {
        const rowArray = Object.values(row)
        return [...rowArray.slice(0, newColumnIdx), "", ...rowArray.slice(newColumnIdx)]
      })

      setData({
        columns: newColumns,
        attributes: newAttributes,
        data: newData,
      })

      setNewColumnData({
        name: "",
        datatype: "text",
        description: "",
        unique: false,
        mandatory: false,
        computeField: false,
        search: false,
        columnName: "",
      })

      setShowAddColumnModal(false)

      if (pushColumn) {
        await pushColumn({
          title: newColumnData.name,
          description: newColumnData.description,
          unique: newColumnData.unique,
          mandatory: newColumnData.mandatory,
          computeField: newColumnData.computeField,
          search: newColumnData.search,
          datatype: newColumnData.datatype,
          appendColumn: addColumnPosition === "right",
          columnName: currentIndex !== null ? data.columns[currentIndex] : data.columns[data.columns.length - 1],
        })
      }
    } else if (data.columns.includes(newColumnData.name)) {
      console.log("Column already exists")
    }
  }

  const handleDeleteColumn = async (index) => {
    if (index < 2) {
      console.log("First two columns are protected")
      return
    }

    if (deleteColumn) {
      await deleteColumn(data.columns[index])
    }

    const newColumns = data.columns.filter((col) => col !== data.columns[index])
    const newAttributes = data.attributes?.filter((attr = {}) => {
      return attr?.title && attr.title !== data.columns[index]
    })
    const newData = data.data.map((row) => row.filter((_, i) => i !== index))
    setData({ columns: newColumns, attributes: newAttributes, data: newData })
    setEditingColumnIndex(null)
  }

  const addRowData = () => {
    setData((prevData) => ({
      ...prevData,
      data: [...prevData.data, newRowData],
    }))
    setNewRowData(data.columns.map(() => ""))
    setShowNewRowModal(false)
  }

  const deleteRows = async (rowIndexes, isSample = false) => {
    try {
      rowIndexes?.forEach(async (index) => {
        if (deleteRow) {
          const isDeleted = await deleteRow(null, index, isSample, index, recordToDeleteIsSample)
          if (isDeleted) {
            const newData = data.data.filter((_, index) => !rowIndexes.includes(index))
            setData((prevData) => ({
              ...prevData,
              data: newData,
            }))
            setRowSelection({})
          }
        }
      })
    } catch (error) {
      console.log("Error: ", error)
    }
  }

  const updateColumn = async (index, updatedColumn) => {
    if (index < 2) {
      console.log("First two columns cannot be modified")
      return
    }

    if (updatedColumn.name !== data.columns[index] && data.columns.includes(updatedColumn.name)) {
      console.log("Column already exists")
      return
    }

    const newColumns = [...data.columns]
    newColumns[index] = updatedColumn.name
    const newAttributes = [...data.attributes]
    newAttributes[index] = {
      ...newAttributes[index],
      title: updatedColumn.name,
      description: updatedColumn.description,
      unique: updatedColumn.unique,
      mandatory: updatedColumn.mandatory,
      search: updatedColumn.search,
      computeField: updatedColumn.computeField,
      datatype: updatedColumn.datatype,
    }

    setData((prevData) => ({
      ...prevData,
      columns: newColumns,
      attributes: newAttributes,
    }))

    if (editColumn) {
      await editColumn({
        columnName: data.columns[index],
        title: updatedColumn.name,
        description: updatedColumn.description,
        unique: updatedColumn.unique,
        mandatory: updatedColumn.mandatory,
        search: updatedColumn.search,
        connectedClassifier: connectedClassifier,
        connectedClassifierField: selectedColumn,
        connectedClassifierFileName: fileName,
        header: updatedColumn.header,
        computeField: updatedColumn.computeField,
        datatype: updatedColumn.datatype,
      })
    }

    setEditingColumnIndex(null)
    setEditedColumn(null)
  }

  const savedPage = localStorage.getItem("tableCurrentPage")
  const initialPageIndex = savedPage ? Number.parseInt(savedPage, 10) : 0

  const table = useReactTable({
    data: data.data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row, index) => index,
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: initialPageIndex,
      },
    },
  })

  useEffect(() => {
    if (data.data.length > 0) {
      const savedPage = localStorage.getItem("tableCurrentPage")
      if (savedPage !== null) {
        const pageIndex = Number.parseInt(savedPage, 10)
        if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < table.getPageCount()) {
          table.setPageIndex(pageIndex)
        }
      }
    }
  }, [data.data, table])

  const handleEditRow = (rowIndex) => {
    setEditingRowIndex(rowIndex)
    if (Array.isArray(data.data[rowIndex])) {
      setNewRowData([...data.data[rowIndex]])
    } else {
      setNewRowData({ ...data.data[rowIndex] })
    }
    setShowNewRowModal(true)
  }

  const addOrUpdateRow = () => {
    if (editingRowIndex !== null) {
      const newData = [...data.data]
      const columns = [...data.columns]
      newData[editingRowIndex] = newRowData
      const newData2 = newData.map((row) => {
        const rowObject = {}
        columns.forEach((col, index) => {
          rowObject[col] = row[index]
        })
        return rowObject
      })
      setData((prevData) => ({
        ...prevData,
        data: newData,
      }))
      if (updateRow) {
        updateRow(newData2, editingRowIndex, isSample)
      }
      setEditingRowIndex(null)
    } else {
      if (addRow) {
        addRow(newRowData)
      }
    }
    setNewRowData(data.columns.map(() => ""))
    setShowNewRowModal(false)
  }

  const addNewColumnWithOptions = () => {
    setShowAddColumnModal(true)

    const currentHeaders = table.getHeaderGroups() || []
    const { headers = [] } = currentHeaders[0] || {}

    const headersGroup =
      headers.reduce((acc, header) => {
        const { id = "", index = 0 } = header || {}
        if (id !== "select" && id !== "actions") {
          acc.push({
            id,
            index,
          })
        }
        return acc
      }, []) || []

    setNewColumnHeaders(headersGroup)

    if (data.columns.length <= 2) {
      setAddColumnPosition("right")
      setNewColumnIndex(1)
      setNewColumnData((prev) => ({
        ...prev,
        columnName: "Date/Time",
      }))
    } else {
      setAddColumnPosition("right")
      const lastColumn = headersGroup[headersGroup.length - 1]
      setNewColumnIndex(data.columns.indexOf(lastColumn.id))
      setNewColumnData((prev) => ({
        ...prev,
        columnName: lastColumn.id,
      }))
    }
  }

  const chooseColumnNameForNewColumn = (value) => {
    if (!value) return
    setNewColumnIndex(data.columns.indexOf(value))

    setNewColumnData((prev) => ({
      ...prev,
      columnName: value,
    }))

    if (value === "FileName") {
      setAddColumnPosition("right")
    } else if (value === "Date/Time" && data.columns.length <= 2) {
      setAddColumnPosition("right")
    } else if (addColumnPosition === null) {
      setAddColumnPosition("right")
    }
  }

  return (
    <>
    
     <div
     className="pagination-responsive"
      style={{
        width: "100%",
        backgroundColor: "hsl(var(--background))",
        height: "64vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Actions */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(to right, rgb(240 253 244), rgb(209 250 229))",
          borderRadius: "1rem",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {/* Upload Button */}
          <Button
            className="choose-file"
            style={{
              backgroundColor: "rgb(22 163 74)",
              color: "white",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
              borderRadius: "0.75rem",
              fontWeight: "500",
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.15s ease-in-out",
            }}
            onMouseOut={(e) => (e.target.style.backgroundColor = "rgb(22 163 74)")}
          >
            <Plus style={{ height: "1.25rem", width: "1.25rem" }} />
            <span style={{ fontWeight: "600" }}>{t("home.upload")}</span>
          </Button>

          {/* Column + Row buttons */}
          <div
            className="buttons-container"
            style={{
              display: "flex",
              gap: "0.75rem",
            }}
          >
            <Button
              variant="outline"
              onClick={addNewColumnWithOptions}
              style={{
                backgroundColor: "rgb(249 250 251)",
                color: "rgb(55 65 81)",
                border: "1px solid rgb(187 247 208)",
                borderRadius: "0.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "background-color 0.15s ease-in-out",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "rgb(243 244 246)")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "rgb(249 250 251)")}
            >
              <Plus style={{ height: "1rem", width: "1rem", color: "rgb(107 114 128)" }} />
              {t("buttons.addColumn")}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowNewRowModal(true)}
              style={{
                backgroundColor: "rgb(249 250 251)",
                color: "rgb(55 65 81)",
                border: "1px solid rgb(187 247 208)",
                borderRadius: "0.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "background-color 0.15s ease-in-out",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "rgb(243 244 246)")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "rgb(249 250 251)")}
            >
              <Plus style={{ height: "1rem", width: "1rem", color: "rgb(107 114 128)" }} />
              {t("buttons.addRow")}
            </Button>
          </div>
        </div>

        {/* Responsive CSS */}
        <style>
          {`
          @media (max-width: 767px) {
            .buttons-container {
              width: 100%;
              flex-direction: column;
            }
            .buttons-container button {
              width: 100%;
            }
          }
        `}
        </style>
      </div>
      {/* Table */}
      {/* Table Container */}
      <div className="very-thin-scroll"
        style={{
          borderRadius: "1rem",
          borderColor: "rgb(243 244 246)",
          flex: 1,
          // overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "200px", // Fixed height to enable proper scrolling
          minHeight: "200px", // Minimum height
          maxHeight: "60vh", // Responsive max height
        }}
      >
       
          <Table
            style={{
              minWidth: "max-content",
              width: "100%",
            }}
          >
            <TableHeader
              style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                backdropFilter: "blur(8px)",
                borderBottom: "2px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      style={{
                        paddingLeft: "2rem",
                        paddingRight: "2rem",
                        paddingTop: "1.5rem",
                        paddingBottom: "1.5rem",
                        fontWeight: "700",
                        fontSize: "0.875rem",
                        color: "#1e293b",
                        borderRight: index !== headerGroup.headers.length - 1 ? "1px solid #f1f5f9" : "none",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "1rem",
                            }}
                          >
                            <div
                              style={{
                                cursor: header.column.getCanSort() ? "pointer" : "default",
                                userSelect: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                transition: "all 0.2s ease-in-out",
                              }}
                              onClick={header.column.getToggleSortingHandler()}
                              onMouseOver={(e) => {
                                if (header.column.getCanSort()) {
                                  e.currentTarget.style.color = "#16a34a" // green-600
                                }
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.color = "#1e293b"
                              }}
                            >
                              <span style={{ fontSize: "0.875rem", fontWeight: "700" }}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </span>
                              {header.column.getCanSort() && (
                                <span>
                                  {header.column.getIsSorted() === "asc" ? (
                                    <ChevronUp style={{ height: "1rem", width: "1rem", color: "#16a34a" }} />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ChevronDown style={{ height: "1rem", width: "1rem", color: "#16a34a" }} />
                                  ) : (
                                    <ArrowUpDown style={{ height: "1rem", width: "1rem", color: "#94a3b8" }} />
                                  )}
                                </span>
                              )}
                            </div>
                            {header.id !== "actions" && index > 1 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    style={{
                                      height: "2rem",
                                      width: "2rem",
                                      padding: 0,
                                      borderRadius: "0.5rem",
                                      transition: "all 0.2s ease-in-out",
                                    }}
                                  >
                                    <Settings style={{ height: "1rem", width: "1rem", color: "#64748b" }} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent style={{ background: "white" }}>
                                  {index >= 2 && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        const index = data.columns.indexOf(header.id)
                                        setEditingColumnIndex(index)
                                        setEditedColumn({
                                          name: data.columns[index],
                                          ...data.attributes[index],
                                        })
                                      }}
                                    >
                                      <Edit style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                                      Edit Column
                                    </DropdownMenuItem>
                                  )}
                                  {data.columns.indexOf(header.id) >= 2 && (
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteColumn(data.columns.indexOf(header.id))}
                                      style={{ color: "#dc2626" }}
                                    >
                                      <Trash2 style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                                      Delete Column
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          {header.column.getCanFilter() && header.id !== "actions" ? (
                            <Input
                              placeholder={`Filter ${header.column.columnDef.header}`}
                              value={header.column.getFilterValue() ?? ""}
                              onChange={(e) => header.column.setFilterValue(e.target.value)}
                              style={{
                                width: "100%",
                                borderColor: "#e2e8f0",
                                borderRadius: "0.75rem",
                                fontSize: "0.875rem",
                                paddingLeft: "1rem",
                                paddingRight: "1rem",
                                paddingTop: "0.75rem",
                                paddingBottom: "0.75rem",
                                backgroundColor: "white",
                                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                                transition: "all 0.2s ease-in-out",
                              }}
                            />
                          ) : null}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="very-thin-scroll" style={{
            flex: 1,
            overflow: "auto", // This will handle both horizontal and vertical scrolling
            minHeight: 0, // Important for flex children
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 #f1f5f9",
          }}>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      paddingTop: "3rem",
                      paddingBottom: "3rem",
                      color: "rgb(107 114 175)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                        justifyContent: "center",
                        height: "230px",
                      }}
                    >
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          backgroundColor: "rgb(243 244 246)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: "rgb(156 163 175)", fontSize: "1.25rem" }}>📄</span>
                      </div>
                      <p style={{ fontWeight: "500" }}>No data found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    style={{
                      backgroundColor: row.original.isSample ? "rgb(219 234 254 / 0.3)" : "transparent",
                      transition: "background-color 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                    onMouseOver={
                      (e) =>
                        (e.currentTarget.style.backgroundColor = row.original.isSample
                          ? "rgba(16, 185, 129, 0.25)" // green for sample rows
                          : "rgba(16, 185, 129, 0.15)") // green for normal rows
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = row.original.isSample
                        ? "rgb(219 234 254 / 0.3)"
                        : "transparent")
                    }
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          paddingLeft: "1.5rem",
                          paddingRight: "1.5rem",
                          paddingTop: "1rem",
                          paddingBottom: "1rem",
                          fontSize: "0.875rem",
                          color: "rgb(55 65 81)",
                          verticalAlign: "top",
                          borderRight:
                            cellIndex !== row.getVisibleCells().length - 1 ? "1px solid rgb(249 250 251)" : "none",
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      
      </div>
 {table.getRowModel().rows.length > 0 && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              flexShrink: 0,
              // marginTop:"40px",
              borderTop: "1px solid #e5e7eb", // gray-200
              backgroundColor: "#f9fafb",
              padding: isCollapsed ? "0rem 0rem" : "1rem 1.5rem",
              zIndex: 10,
              boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Results info */}
              <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                Showing{" "}
                <span style={{ fontWeight: 500 }}>
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                </span>{" "}
                to{" "}
                <span style={{ fontWeight: 500 }}>
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length,
                  )}
                </span>{" "}
                of <span style={{ fontWeight: 500 }}>{table.getFilteredRowModel().rows.length}</span> results
              </div>

              {/* Pagination controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {/* Previous */}
                <button
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    color: "#374151",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
                    opacity: table.getCanPreviousPage() ? 1 : 0.5,
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (table.getCanPreviousPage()) e.currentTarget.style.backgroundColor = "#f3f4f6"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white"
                  }}
                  onClick={() => {
                    table.previousPage()
                    localStorage.setItem("tableCurrentPage", String(table.getState().pagination.pageIndex))
                  }}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                    const pageIndex = table.getState().pagination.pageIndex
                    let pageNumber

                    if (table.getPageCount() <= 5) {
                      pageNumber = i
                    } else if (pageIndex < 3) {
                      pageNumber = i
                    } else if (pageIndex > table.getPageCount() - 4) {
                      pageNumber = table.getPageCount() - 5 + i
                    } else {
                      pageNumber = pageIndex - 2 + i
                    }

                    const isActive = pageIndex === pageNumber

                    return (
                      <button
                        key={pageNumber}
                        style={{
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "0.375rem",
                          backgroundColor: isActive ? "#16a34a" : "white",
                          color: isActive ? "white" : "#374151",
                          border: `1px solid ${isActive ? "#16a34a" : "#e5e7eb"}`,
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = "#f3f4f6"
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = isActive ? "#16a34a" : "white"
                        }}
                        onClick={() => {
                          table.setPageIndex(pageNumber)
                          localStorage.setItem("tableCurrentPage", String(pageNumber))
                        }}
                      >
                        {pageNumber + 1}
                      </button>
                    )
                  })}
                </div>

                {/* Next */}
                <button
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    color: "#374151",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
                    opacity: table.getCanNextPage() ? 1 : 0.5,
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (table.getCanNextPage()) e.currentTarget.style.backgroundColor = "#f3f4f6"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white"
                  }}
                  onClick={() => {
                    table.nextPage()
                    localStorage.setItem("tableCurrentPage", String(table.getState().pagination.pageIndex))
                  }}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

   
    </>
   
  )
}
