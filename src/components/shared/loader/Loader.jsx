import React, { useContext } from "react";
import { Loader2 } from "lucide-react";
import { ListContext } from "../../../context/list";
import useWindowDimensions from "../../../utiles/getWindowDimensions";

function Loader() {
  const { openSideBar } = useContext(ListContext);
  const { width } = useWindowDimensions();

  return (
    <div className="w-full flex">
      <div
        className="bg-gray-100 rounded-lg p-3 flex items-center justify-center"
        style={{
          marginLeft: !openSideBar && width > 722 ? "300px" : "0px",
        }}
      >
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    </div>
  );
}

export default Loader;
