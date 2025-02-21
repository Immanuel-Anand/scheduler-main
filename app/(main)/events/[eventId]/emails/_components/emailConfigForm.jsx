'use client'

import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs"
import { Card } from "../../../../../../components/ui/card"
import { Button } from "../../../../../../components/ui/button"
import { Input } from "../../../../../../components/ui/input"
import { Textarea } from "../../../../../../components/ui/textarea"
import { useToast } from "../../../../../../hooks/use-toast";
import { updateEmailConfig } from "../../../../../../actions/events"
import { Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/select"
import { Checkbox } from "../../../../../../components/ui/checkbox"
import { Switch } from "../../../../../../components/ui/switch"

export default function EmailConfigForm({ event, defaultValues }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState(event.emailConfig?.replyTo || 'host')
  const [reminderEnabled, setReminderEnabled] = useState(event.emailConfig?.reminderEnabled ?? false)
  const [followupEnabled, setFollowupEnabled] = useState(event.emailConfig?.followupEnabled ?? false)

  // Define default templates
  const systemDefaultValues = {
    confirmation: {
      subject: "Confirmed: {{event_name}} with {{my_name}} on {{event_date}}",
      body: `Hi {{invitee_full_name}},

Thanks for reaching out.
Your {{event_name}} with {{my_name}} at {{event_time}} on {{event_date}} is scheduled.
{{event_description}}
{{location}}
{{questions_and_answers}}`
    },
    cancellation: {
      subject: "Cancelled: {{event_name}} on {{event_date}}",
      body: `Hi {{invitee_full_name}},

This email confirms that your {{event_name}} with {{my_name}} on {{event_date}} at {{event_time}} has been cancelled.

You can schedule a new meeting at your convenience: {{scheduling_link}}

Best regards,
{{my_name}}`
    },
    reminder: {
      subject: "Reminder: {{event_name}} with {{my_name}} starts in {{time_before_event}}",
      body: `Hi {{invitee_full_name}},

This is a reminder that your {{event_name}} with {{my_name}} starts in {{time_before_event}}.

Date & Time: {{event_date}} at {{event_time}}
{{location}}

Looking forward to our meeting!

Best regards,
{{my_name}}`,
      timings: [24]
    },
    followup: {
      subject: "Thank you for attending {{event_name}}",
      body: `Hi {{invitee_full_name}},

Thank you for attending the {{event_name}} with {{my_name}}.

We hope the session was valuable for you. If you have any questions or need further assistance, please don't hesitate to reach out.

To schedule another meeting, you can use this link: {{scheduling_link}}

Best regards,
{{my_name}}`,
      timings: [24]
    }
  }

  const handleSubmit = async (type, data) => {
    try {
      setLoading(true)
      const result = await updateEmailConfig({
        eventId: event.id,
        type,
        replyTo,
        enabled: type === 'reminder' ? reminderEnabled : type === 'followup' ? followupEnabled : true,
        ...data
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Email settings updated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-1 block">Reply-to Email Address</label>
        <Select 
          value={replyTo} 
          onValueChange={setReplyTo}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select reply-to email" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="host">Host's Email Address</SelectItem>
            <SelectItem value="noreply">No-reply Email Address</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          This setting applies to all email types
        </p>
      </div>

      <Tabs defaultValue="confirmation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="confirmation">Confirmation</TabsTrigger>
          <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
          <TabsTrigger value="reminder">
            Reminder {!reminderEnabled && "(Off)"}
          </TabsTrigger>
          <TabsTrigger value="followup">
            Follow-up {!followupEnabled && "(Off)"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmation">
          <EmailConfigCard
            title="Confirmation Email"
            description="Sent immediately after an event is scheduled"
            defaultValues={defaultValues.confirmation}
            systemDefaultValues={systemDefaultValues.confirmation}
            onSubmit={(data) => handleSubmit('confirmation', data)}
            loading={loading}
            type="confirmation"
            enabled={reminderEnabled}
            onEnabledChange={setReminderEnabled}
          />
        </TabsContent>

        <TabsContent value="cancellation">
          <EmailConfigCard
            title="Cancellation Email"
            description="Sent when an event is cancelled"
            defaultValues={defaultValues.cancellation}
            systemDefaultValues={systemDefaultValues.cancellation}
            onSubmit={(data) => handleSubmit('cancellation', data)}
            loading={loading}
            type="cancellation"
            enabled={reminderEnabled}
            onEnabledChange={setReminderEnabled}
          />
        </TabsContent>

        <TabsContent value="reminder">
          <EmailConfigCard
            title="Reminder Email"
            description="Sent before the scheduled event"
            defaultValues={defaultValues.reminder}
            systemDefaultValues={systemDefaultValues.reminder}
            onSubmit={(data) => handleSubmit('reminder', data)}
            loading={loading}
            includeTimingOptions
            type="reminder"
            enabled={reminderEnabled}
            onEnabledChange={setReminderEnabled}
          />
        </TabsContent>

        <TabsContent value="followup">
          <EmailConfigCard
            title="Follow-up Email"
            description="Sent after the event is completed"
            defaultValues={defaultValues.followup}
            systemDefaultValues={systemDefaultValues.followup}
            onSubmit={(data) => handleSubmit('followup', data)}
            loading={loading}
            includeTimingOptions
            type="followup"
            enabled={followupEnabled}
            onEnabledChange={setFollowupEnabled}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmailConfigCard({ 
  title, 
  description, 
  defaultValues = {}, 
  systemDefaultValues = {},
  onSubmit, 
  loading,
  includeTimingOptions,
  type,
  enabled,
  onEnabledChange
}) {
  console.log('EmailConfigCard received defaultValues:', defaultValues)

  // Store the initial default values separately
  const initialDefaultSubject = useMemo(() => defaultValues?.subject || '', [defaultValues?.subject])
  const initialDefaultBody = useMemo(() => defaultValues?.body || '', [defaultValues?.body])
  const initialDefaultTimings = useMemo(() => defaultValues?.timings || [24], [defaultValues?.timings])

  // Current editable values
  const [subject, setSubject] = useState(initialDefaultSubject)
  const [body, setBody] = useState(initialDefaultBody)
  const [timings, setTimings] = useState(initialDefaultTimings)
  const [cancellationPolicy, setCancellationPolicy] = useState(defaultValues?.cancellationPolicy || '')
  const [includeCancelLinks, setIncludeCancelLinks] = useState(defaultValues?.includeCancelLinks ?? true)

  // Update current values when default values change
  useEffect(() => {
    setSubject(initialDefaultSubject)
    setBody(initialDefaultBody)
    setTimings(initialDefaultTimings)
  }, [initialDefaultSubject, initialDefaultBody, initialDefaultTimings])

  const handleUseDefaultSubject = (e) => {
    e.preventDefault()
    setSubject(systemDefaultValues.subject)
  }

  const handleUseDefaultBody = (e) => {
    e.preventDefault()
    setBody(systemDefaultValues.body)
  }

  const addTiming = () => {
    setTimings([...timings, 24])
  }

  const removeTiming = (index) => {
    setTimings(timings.filter((_, i) => i !== index))
  }

  const updateTiming = (index, value) => {
    const newTimings = [...timings]
    newTimings[index] = Number(value)
    setTimings(newTimings)
  }

  // Show additional fields only for confirmation and reminder emails
  const showAdditionalFields = type === 'confirmation' || type === 'reminder'

  // Only show enable switch for reminder and follow-up
  const showEnableSwitch = type === 'reminder' || type === 'followup'

  // Only check enabled state for reminder and follow-up
  const shouldShowContent = !showEnableSwitch || enabled

  return (
    <Card className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {showEnableSwitch && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={enabled}
              onCheckedChange={onEnabledChange}
              id={`${type}-enable-switch`}
            />
            <label
              htmlFor={`${type}-enable-switch`}
              className="text-sm text-muted-foreground"
            >
              {enabled ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        )}
      </div>

      {shouldShowContent ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Subject</label>
              <button
                onClick={handleUseDefaultSubject}
                className="text-xs text-blue-600 hover:underline"
                type="button"
              >
                use default text
              </button>
            </div>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Email Body</label>
              <button
                onClick={handleUseDefaultBody}
                className="text-xs text-blue-600 hover:underline"
                type="button"
              >
                use default text
              </button>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter email content"
              className="mt-1 h-48"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available variables: {`{{event_name}}, {{my_name}}, {{event_date}}, {{event_time}}, {{invitee_full_name}}, {{event_description}}, {{location}}, {{questions_and_answers}}, {{scheduling_link}}`}
              {includeTimingOptions && `, {{time_before_event}}`}
            </p>
          </div>

          {showAdditionalFields && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Cancellation Policy (Optional)</label>
                <Textarea
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  placeholder="Enter your cancellation policy"
                  className="mt-1 h-24"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be included in the email to inform guests about your cancellation policy
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cancelLinks"
                  checked={includeCancelLinks}
                  onCheckedChange={setIncludeCancelLinks}
                />
                <label
                  htmlFor="cancelLinks"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include the links for cancel and reschedule in the email invitations and reminders (recommended)
                </label>
              </div>
            </>
          )}

          {includeTimingOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Timing (hours)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTiming}
                  disabled={timings.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Timing
                </Button>
              </div>
              <div className="space-y-2">
                {timings.map((timing, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={timing}
                      onChange={(e) => updateTiming(index, e.target.value)}
                      min={1}
                      max={72}
                      className="w-32"
                    />
                    {timings.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTiming(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You can add up to 5 different timings
              </p>
            </div>
          )}

          <Button 
            onClick={() => onSubmit({ 
              subject, 
              body, 
              timings,
              ...(showAdditionalFields && {
                cancellationPolicy,
                includeCancelLinks
              })
            })}
            disabled={loading}
            className="mt-4"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enable this option to configure {type} emails.
        </p>
      )}
    </Card>
  )
} 