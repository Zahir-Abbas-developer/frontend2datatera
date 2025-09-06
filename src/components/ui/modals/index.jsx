import React from "react"
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Globe,
  Search,
  MoreVertical,
  LogOut,
  Settings,
  Star,
  User,
  Upload,
  X,
} from "lucide-react"
import { Formik } from "formik"
import { AiOutlineEdit, AiOutlineDelete, AiOutlineCopy, AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkles } from "lucide-react"

// ✅ Custom Modal Component
const CustomModal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-hidden">
        <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
          <button
            onClick={onClose}
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
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
      </div>
    </div>
  )
}
export default CustomModal