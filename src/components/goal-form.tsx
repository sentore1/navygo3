"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Widget,
  WidgetContent,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from "./ui/widget";
import { Target, Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export default function GoalForm({
  onSubmit = () => {},
  onClose = () => {},
  initialData = null,
}: {
  onSubmit?: (data: any) => void;
  onClose?: () => void;
  initialData?: any;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [milestones, setMilestones] = useState<Milestone[]>(
    initialData?.milestones || [],
  );
  const [date, setDate] = useState<Date | undefined>(
    initialData?.targetDate ? new Date(initialData.targetDate) : new Date(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: Date.now().toString(),
        title: "",
        description: "",
        completed: false,
      },
    ]);
  };

  const updateMilestone = (
    id: string,
    field: keyof Milestone,
    value: string | boolean,
  ) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone,
      ),
    );
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((milestone) => milestone.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const goalData = {
        title,
        description,
        milestones: milestones.filter((m) => m.title.trim() !== ""),
        createdAt: new Date().toISOString(),
        targetDate: date ? date.toISOString() : null,
        progress: 0,
        streak: 0,
        lastUpdated: null,
      };

      await onSubmit(goalData);

      // Reset form
      setTitle("");
      setDescription("");
      setMilestones([]);
      setDate(new Date());

      // Close the form
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Widget design="mumbai" className="w-full max-w-lg mx-auto gap-3">
      <WidgetHeader className="justify-center">
        <WidgetTitle className="flex items-center gap-2">
          Create New Goal
        </WidgetTitle>
      </WidgetHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <WidgetContent className="flex-col gap-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs text-muted-foreground">Goal Title</Label>
            <Input
              id="title"
              placeholder="Enter your goal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
              className="text-sm h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your goal in detail"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={isSubmitting}
              className="text-sm min-h-[60px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs text-muted-foreground">Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm",
                    !date && "text-muted-foreground",
                  )}
                  disabled={isSubmitting}
                >
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">Milestones</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMilestone}
                className="flex items-center gap-1 text-xs h-6 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="flex gap-2 items-start hover:bg-muted/50 p-2 rounded-md"
                >
                  <div className="flex-grow space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted text-muted-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) =>
                          updateMilestone(milestone.id, "title", e.target.value)
                        }
                        disabled={isSubmitting}
                        className="text-xs h-7"
                      />
                    </div>
                    <Textarea
                      placeholder="Description (optional)"
                      value={milestone.description || ""}
                      onChange={(e) =>
                        updateMilestone(
                          milestone.id,
                          "description",
                          e.target.value,
                        )
                      }
                      rows={2}
                      className="text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMilestone(milestone.id)}
                    className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {milestones.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addMilestone}
                  className="flex items-center gap-1 text-xs h-6 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              )}
            </div>
          </div>
        </WidgetContent>

        <WidgetFooter className="flex w-full justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !title.trim()}
            className="gap-1.5 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Creating...
              </>
            ) : (
              <>Create Goal</>
            )}
          </Button>
        </WidgetFooter>
      </form>
    </Widget>
  );
}
