"use client";

import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ViewResourceDialog } from "./view-resource-dialog";
import { EditResourceDialog } from "./edit-resource-dialog";

interface ResourceActionsProps {
  resourceId: string;
  resourceType: 'knowledge_base' | 'cultural_story';
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ResourceActions({ 
  resourceId, 
  resourceType, 
  onView, 
  onEdit, 
  onDelete 
}: ResourceActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleView = () => {
    if (onView) {
      onView(resourceId);
    } else {
      // Open the view dialog
      setShowViewDialog(true);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(resourceId);
    } else {
      // Open the edit dialog
      setShowEditDialog(true);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${resourceType === 'cultural_story' ? 'story' : 'resource'}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Get access token
      let accessToken = null;
      try {
        const projectRef = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
        if (projectRef) {
          accessToken = JSON.parse(localStorage.getItem(projectRef) || '{}').access_token;
        }
      } catch (err) {}

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/admin/knowledge-resource/${resourceId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        toast.success(`${resourceType === 'cultural_story' ? 'Story' : 'Resource'} deleted successfully!`);
        if (onDelete) {
          onDelete(resourceId);
        } else {
          // Refresh the page
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete resource");
      }
    } catch (error) {
      toast.error("Failed to delete resource");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2 ml-4">
        <Button 
          size="sm" 
          variant="outline" 
          title="View Details"
          onClick={handleView}
        >
          <Eye className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          title={`Edit ${resourceType === 'cultural_story' ? 'Story' : 'Resource'}`}
          onClick={handleEdit}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-red-600 hover:text-red-700" 
          title={`Delete ${resourceType === 'cultural_story' ? 'Story' : 'Resource'}`}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <ViewResourceDialog
        resourceId={resourceId}
        resourceType={resourceType}
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
      />

      <EditResourceDialog
        resourceId={resourceId}
        resourceType={resourceType}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
} 