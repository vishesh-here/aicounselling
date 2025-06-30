"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCard = void 0;
const card_1 = require("./card");
const badge_1 = require("./badge");
const checkbox_1 = require("./checkbox");
const button_1 = require("./button");
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
function TaskCard({ id, title, description, category, completed, onComplete, onDelete, onEdit, }) {
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
      <card_1.Card className={`w-full ${completed ? 'opacity-60' : ''}`}>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <checkbox_1.Checkbox checked={completed} onCheckedChange={(checked) => onComplete(id, checked)}/>
            <card_1.CardTitle className={`text-lg ${completed ? 'line-through' : ''}`}>
              {title}
            </card_1.CardTitle>
          </div>
          <div className="flex space-x-2">
            <button_1.Button variant="ghost" size="icon" onClick={() => onEdit(id)}>
              <lucide_react_1.Pencil className="h-4 w-4"/>
            </button_1.Button>
            <button_1.Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
              <lucide_react_1.Trash2 className="h-4 w-4"/>
            </button_1.Button>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <badge_1.Badge variant="secondary" className="mt-2">
            {category}
          </badge_1.Badge>
        </card_1.CardContent>
      </card_1.Card>
    </framer_motion_1.motion.div>);
}
exports.TaskCard = TaskCard;
