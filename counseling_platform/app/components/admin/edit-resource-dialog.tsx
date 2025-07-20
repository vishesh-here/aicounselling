"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Edit } from "lucide-react";
import { toast } from "sonner";

interface EditResourceDialogProps {
  resourceId: string;
  resourceType: 'knowledge_base' | 'cultural_story';
  isOpen: boolean;
  onClose: () => void;
}

export function EditResourceDialog({ 
  resourceId, 
  resourceType, 
  isOpen, 
  onClose 
}: EditResourceDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit {resourceType === 'cultural_story' ? 'Story' : 'Resource'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-center py-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Edit className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Edit Functionality Coming Soon
              </h3>
              <p className="text-gray-600 mb-4">
                The edit functionality is being developed. For now, you can view the resource details and delete if needed.
              </p>
              <div className="text-sm text-gray-500">
                Resource ID: {resourceId}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  toast.info("Edit functionality will be implemented soon!");
                  onClose();
                }}
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 