'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addApplication } from './actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Link, Users, Calendar, Bell } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-semibold text-lg py-6">
      {pending ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center"
        >
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Saving...
        </motion.div>
      ) : (
        'Save Application'
      )}
    </Button>
  );
}

const initialState = {
  errors: {},
  success: false,
};

export function AddApplicationForm({ onFormSubmit }: { onFormSubmit?: () => void }) {
  const [state, formAction] = useActionState(addApplication, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [referral, setReferral] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setReferral(false);
      setReminder(false);
      setFollowUpDate(undefined);
      if (onFormSubmit) {
        onFormSubmit();
      }
    }
  }, [state, onFormSubmit]);
  
  const handleDateChange = (date: Date | undefined) => {
    setFollowUpDate(date);
    if(date) {
      setReminder(true);
    } else {
      setReminder(false);
    }
  }

  return (
    <motion.form 
      ref={formRef} 
      action={formAction} 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-lg">Company</Label>
          <Input id="company" name="company" required className="py-6 text-lg" />
          {state.errors?.company && <p className="text-red-400 text-sm mt-1">{state.errors.company[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role" className="text-lg">Role</Label>
          <Input id="role" name="role" required className="py-6 text-lg" />
          {state.errors?.role && <p className="text-red-400 text-sm mt-1">{state.errors.role[0]}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="link" className="text-lg flex items-center"><Link className="mr-2 h-4 w-4" />Application Link</Label>
        <Input id="link" name="link" placeholder="https://example.com/job-posting" className="py-6 text-lg" />
        {state.errors?.link && <p className="text-red-400 text-sm mt-1">{state.errors.link[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-lg">Status</Label>
        <Select name="status" required>
          <SelectTrigger className="py-6 text-lg">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interviewing">Interviewing</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-lg">Notes</Label>
        <Textarea id="notes" name="notes" rows={4} className="text-lg" />
      </div>
      
      <div className="space-y-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <Label htmlFor="referral" className="text-lg flex items-center"><Users className="mr-2 h-5 w-5" />Got a referral?</Label>
          <Switch id="referral" name="referral" checked={referral} onCheckedChange={setReferral} />
        </div>
        <AnimatePresence>
          {referral && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 overflow-hidden"
            >
              <Label htmlFor="referral_source" className="text-lg">Referral Source</Label>
              <Input id="referral_source" name="referral_source" placeholder="e.g., Jane Doe @ Company" className="py-6 text-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder" className="text-lg flex items-center"><Bell className="mr-2 h-5 w-5" />Set a follow-up reminder?</Label>
          <Switch id="reminder" name="reminder_enabled" checked={reminder} onCheckedChange={setReminder} />
        </div>
        <AnimatePresence>
          {reminder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 overflow-hidden"
            >
              <Label htmlFor="follow_up_date" className="text-lg flex items-center"><Calendar className="mr-2 h-4 w-4" />Follow-up Date</Label>
              <DatePicker date={followUpDate} setDate={handleDateChange} />
              <input type="hidden" name="follow_up_date" value={followUpDate ? followUpDate.toISOString().split('T')[0] : ''} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-6">
        <SubmitButton />
        {state.errors?.general && <p className="text-red-400 text-sm mt-4 text-center">{state.errors.general[0]}</p>}
      </div>
    </motion.form>
  );
} 