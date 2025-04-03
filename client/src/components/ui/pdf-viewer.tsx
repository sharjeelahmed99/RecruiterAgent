import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DownloadIcon, 
  Loader2Icon, 
  ZoomInIcon, 
  ZoomOutIcon, 
  PrinterIcon 
} from "lucide-react";

interface PdfViewerProps {
  url: string;
  fileName?: string;
}

export default function PdfViewer({ url, fileName = "report.pdf" }: PdfViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        setIsLoading(false);
      };
    }
  }, [url]);
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };
  
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between items-center p-2 bg-gray-100 rounded-t-md">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 2}
          >
            <ZoomInIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
          >
            <PrinterIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleDownload}
          >
            <DownloadIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>
      
      <div className="relative flex-1 bg-gray-200 rounded-b-md overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader2Icon className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          title="PDF Viewer"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    </div>
  );
}
