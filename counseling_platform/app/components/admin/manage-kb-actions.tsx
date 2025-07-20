"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { BulkImportDialog } from "./bulk-import-dialog";

interface ManageKBActionsProps {
  onImportComplete: () => void;
}

export function ManageKBActions({ onImportComplete }: ManageKBActionsProps) {
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowBulkImportDialog(true)}
      >
        <Upload className="h-4 w-4 mr-2" />
        Bulk Upload
      </Button>

      <BulkImportDialog
        isOpen={showBulkImportDialog}
        onClose={() => setShowBulkImportDialog(false)}
        onImportComplete={() => {
          onImportComplete();
          setShowBulkImportDialog(false);
        }}
      />
    </>
  );
} 