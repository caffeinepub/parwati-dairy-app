import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddDailyOrderRecord,
  useAddRegularCustomer,
  useDailyOrderRecordsByCustomer,
  useDeleteDailyOrderRecord,
  useRecordDailyDelivery,
  useRecordPayment,
  useRegularCustomers,
  useUpdateRegularCustomer,
} from "@/hooks/useQueries";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  IndianRupee,
  Loader2,
  MapPin,
  Milk,
  Pencil,
  Phone,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DailyOrderRecord, RegularCustomer } from "../backend";
import AdminGuard from "../components/AdminGuard";

// ─── Add Customer Form ────────────────────────────────────────────────────────
interface AddCustomerFormProps {
  onClose: () => void;
}

function AddCustomerForm({ onClose }: AddCustomerFormProps) {
  const addCustomer = useAddRegularCustomer();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    dailyMilkQuantity: "",
    pricePerLitre: "60",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    const qty = Number.parseFloat(form.dailyMilkQuantity);
    const price = Number.parseFloat(form.pricePerLitre);
    if (Number.isNaN(qty) || qty <= 0) {
      setError("Please enter a valid daily milk quantity.");
      return;
    }
    if (Number.isNaN(price) || price <= 0) {
      setError("Please enter a valid price per litre.");
      return;
    }
    try {
      await addCustomer.mutateAsync({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        dailyMilkQuantity: qty,
        pricePerLitre: price,
      });
      toast.success(`Customer "${form.name.trim()}" added successfully!`);
      onClose();
    } catch {
      setError("Failed to add customer. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Customer Name *</Label>
          <Input
            id="name"
            placeholder="e.g. Ramesh Kumar"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            placeholder="e.g. 9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="e.g. House No. 12, Main Road"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="qty">Daily Milk Quantity (Litres) *</Label>
          <Input
            id="qty"
            type="number"
            step="0.5"
            min="0.5"
            placeholder="e.g. 2"
            value={form.dailyMilkQuantity}
            onChange={(e) =>
              setForm({ ...form, dailyMilkQuantity: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price per Litre (₹) *</Label>
          <Input
            id="price"
            type="number"
            step="1"
            min="1"
            placeholder="e.g. 60"
            value={form.pricePerLitre}
            onChange={(e) =>
              setForm({ ...form, pricePerLitre: e.target.value })
            }
            required
          />
        </div>
      </div>
      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={addCustomer.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={addCustomer.isPending}>
          {addCustomer.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Edit Customer Form ───────────────────────────────────────────────────────
interface EditCustomerFormProps {
  customer: RegularCustomer;
  onClose: () => void;
}

function EditCustomerForm({ customer, onClose }: EditCustomerFormProps) {
  const updateCustomer = useUpdateRegularCustomer();
  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    dailyMilkQuantity: customer.dailyMilkQuantity.toString(),
    pricePerLitre: customer.pricePerLitre.toString(),
    isActive: customer.isActive,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const qty = Number.parseFloat(form.dailyMilkQuantity);
    const price = Number.parseFloat(form.pricePerLitre);
    if (Number.isNaN(qty) || qty <= 0) {
      setError("Please enter a valid daily milk quantity.");
      return;
    }
    if (Number.isNaN(price) || price <= 0) {
      setError("Please enter a valid price per litre.");
      return;
    }
    try {
      await updateCustomer.mutateAsync({
        customerId: customer.customerId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        dailyMilkQuantity: qty,
        pricePerLitre: price,
        isActive: form.isActive,
      });
      onClose();
    } catch {
      setError("Failed to update customer. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-name">Customer Name *</Label>
          <Input
            id="edit-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-phone">Phone Number *</Label>
          <Input
            id="edit-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-address">Address</Label>
        <Input
          id="edit-address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-qty">Daily Milk Quantity (Litres) *</Label>
          <Input
            id="edit-qty"
            type="number"
            step="0.5"
            min="0.5"
            value={form.dailyMilkQuantity}
            onChange={(e) =>
              setForm({ ...form, dailyMilkQuantity: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-price">Price per Litre (₹) *</Label>
          <Input
            id="edit-price"
            type="number"
            step="1"
            min="1"
            value={form.pricePerLitre}
            onChange={(e) =>
              setForm({ ...form, pricePerLitre: e.target.value })
            }
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="edit-active"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="h-4 w-4 accent-primary"
        />
        <Label htmlFor="edit-active">Active Customer</Label>
      </div>
      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={updateCustomer.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateCustomer.isPending}>
          {updateCustomer.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Record Payment Form ──────────────────────────────────────────────────────
interface RecordPaymentFormProps {
  customer: RegularCustomer;
  onClose: () => void;
}

function RecordPaymentForm({ customer, onClose }: RecordPaymentFormProps) {
  const recordPayment = useRecordPayment();
  const today = new Date().toISOString().split("T")[0];
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(today);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amt = Number.parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    if (!paymentDate) {
      setError("Please select a payment date.");
      return;
    }
    try {
      await recordPayment.mutateAsync({
        customerId: customer.customerId,
        amount: amt,
        paymentDate,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1200);
    } catch {
      setError("Failed to record payment. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <p className="text-lg font-semibold text-foreground">
          Payment Recorded!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="bg-secondary/50 rounded-lg p-3 text-sm">
        <p className="font-medium text-foreground">{customer.name}</p>
        <p className="text-muted-foreground">
          Balance Due:{" "}
          <span className="font-semibold text-destructive">
            ₹{(customer.totalAmountDue - customer.amountReceived).toFixed(2)}
          </span>
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pay-amount">Amount Received (₹) *</Label>
        <Input
          id="pay-amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="e.g. 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pay-date">Payment Date *</Label>
        <Input
          id="pay-date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </div>
      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={recordPayment.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={recordPayment.isPending}>
          {recordPayment.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Recording...
            </>
          ) : (
            <>
              <IndianRupee className="h-4 w-4 mr-2" />
              Record Payment
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Daily Orders Dialog ──────────────────────────────────────────────────────
interface DailyOrdersDialogProps {
  customer: RegularCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DailyOrdersDialog({
  customer,
  open,
  onOpenChange,
}: DailyOrdersDialogProps) {
  const {
    data: records,
    isLoading,
    error,
  } = useDailyOrderRecordsByCustomer(open ? customer.customerId : null);
  const addRecord = useAddDailyOrderRecord();
  const deleteRecord = useDeleteDailyOrderRecord();

  const today = new Date().toISOString().split("T")[0];
  const [showAddForm, setShowAddForm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DailyOrderRecord | null>(
    null,
  );
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    date: today,
    quantityDelivered: customer.dailyMilkQuantity.toString(),
    amountCharged: (
      customer.dailyMilkQuantity * customer.pricePerLitre
    ).toFixed(2),
    notes: "",
  });

  const handleQtyChange = (val: string) => {
    const qty = Number.parseFloat(val);
    const autoAmount = Number.isNaN(qty)
      ? ""
      : (qty * customer.pricePerLitre).toFixed(2);
    setForm((f) => ({
      ...f,
      quantityDelivered: val,
      amountCharged: autoAmount,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const qty = Number.parseFloat(form.quantityDelivered);
    const amt = Number.parseFloat(form.amountCharged);
    if (!form.date) {
      setFormError("Please select a date.");
      return;
    }
    if (Number.isNaN(qty) || qty <= 0) {
      setFormError("Please enter a valid quantity.");
      return;
    }
    if (Number.isNaN(amt) || amt < 0) {
      setFormError("Please enter a valid amount.");
      return;
    }
    try {
      await addRecord.mutateAsync({
        customerId: customer.customerId,
        date: form.date,
        quantityDelivered: qty,
        amountCharged: amt,
        notes: form.notes.trim() || null,
      });
      setShowAddForm(false);
      setForm({
        date: today,
        quantityDelivered: customer.dailyMilkQuantity.toString(),
        amountCharged: (
          customer.dailyMilkQuantity * customer.pricePerLitre
        ).toFixed(2),
        notes: "",
      });
    } catch {
      setFormError("Failed to add record. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteRecord.mutateAsync({
        recordId: recordToDelete.recordId,
        customerId: customer.customerId,
      });
    } catch {
      // silently fail; user can retry
    } finally {
      setRecordToDelete(null);
    }
  };

  const sortedRecords = records
    ? [...records].sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const totalQty = sortedRecords.reduce((s, r) => s + r.quantityDelivered, 0);
  const totalAmt = sortedRecords.reduce((s, r) => s + r.amountCharged, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Daily Orders — {customer.name}
            </DialogTitle>
            <DialogDescription>
              View and manage daily milk delivery records for this customer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
            {/* Summary row */}
            {sortedRecords.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                <div className="bg-secondary/60 rounded-lg px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Total Records: </span>
                  <span className="font-semibold text-foreground">
                    {sortedRecords.length}
                  </span>
                </div>
                <div className="bg-secondary/60 rounded-lg px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Total Qty: </span>
                  <span className="font-semibold text-foreground">
                    {totalQty.toFixed(1)}L
                  </span>
                </div>
                <div className="bg-secondary/60 rounded-lg px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Total Amount: </span>
                  <span className="font-semibold text-foreground">
                    ₹{totalAmt.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Records table */}
            <ScrollArea className="flex-1 border border-border rounded-lg min-h-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center text-destructive text-sm">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  Failed to load records.
                </div>
              ) : sortedRecords.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No daily order records yet.</p>
                  <p className="mt-1">
                    Click "Add Daily Record" to get started.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Qty (L)</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRecords.map((record) => (
                      <TableRow key={Number(record.recordId)}>
                        <TableCell className="font-medium text-sm">
                          {record.date}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {record.quantityDelivered.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          ₹{record.amountCharged.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                          {record.notes ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setRecordToDelete(record)}
                            disabled={deleteRecord.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>

            {/* Add record form */}
            {showAddForm ? (
              <form
                onSubmit={handleAddSubmit}
                className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20"
              >
                <p className="text-sm font-semibold text-foreground">
                  Add Daily Record
                </p>
                {formError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {formError}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="rec-date" className="text-xs">
                      Date *
                    </Label>
                    <Input
                      id="rec-date"
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rec-qty" className="text-xs">
                      Quantity (L) *
                    </Label>
                    <Input
                      id="rec-qty"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={form.quantityDelivered}
                      onChange={(e) => handleQtyChange(e.target.value)}
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rec-amt" className="text-xs">
                      Amount (₹) *
                    </Label>
                    <Input
                      id="rec-amt"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amountCharged}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          amountCharged: e.target.value,
                        }))
                      }
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rec-notes" className="text-xs">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="rec-notes"
                    placeholder="e.g. Extra delivery, holiday, etc."
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormError("");
                    }}
                    disabled={addRecord.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addRecord.isPending}
                  >
                    {addRecord.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Save Record
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Daily Record
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!recordToDelete}
        onOpenChange={(o) => {
          if (!o) setRecordToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the record for{" "}
              <strong>{recordToDelete?.date}</strong> (
              {recordToDelete?.quantityDelivered.toFixed(1)}L — ₹
              {recordToDelete?.amountCharged.toFixed(2)}). This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecord.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Customer Card ────────────────────────────────────────────────────────────
interface CustomerCardProps {
  customer: RegularCustomer;
}

function CustomerCard({ customer }: CustomerCardProps) {
  const recordDelivery = useRecordDailyDelivery();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDailyOrdersDialog, setShowDailyOrdersDialog] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  const balance = customer.totalAmountDue - customer.amountReceived;
  const dailyAmount = customer.dailyMilkQuantity * customer.pricePerLitre;

  const handleRecordDelivery = async () => {
    try {
      await recordDelivery.mutateAsync(customer.customerId);
      setDeliverySuccess(true);
      setTimeout(() => setDeliverySuccess(false), 2000);
    } catch {
      // error handled silently; button re-enables
    }
  };

  return (
    <>
      <Card
        className={`relative overflow-hidden transition-shadow hover:shadow-md ${!customer.isActive ? "opacity-60" : ""}`}
      >
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={customer.isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <CardHeader className="pb-3 pr-20">
          <CardTitle className="text-lg font-bold text-foreground leading-tight">
            {customer.name}
          </CardTitle>
          <div className="flex flex-col gap-1 mt-1">
            {customer.phone && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {customer.phone}
              </span>
            )}
            {customer.address && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {customer.address}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Daily order info */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary/60 rounded-lg p-2.5 text-center">
              <Milk className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Daily Qty</p>
              <p className="font-bold text-foreground text-sm">
                {customer.dailyMilkQuantity}L
              </p>
            </div>
            <div className="bg-secondary/60 rounded-lg p-2.5 text-center">
              <IndianRupee className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Per Litre</p>
              <p className="font-bold text-foreground text-sm">
                ₹{customer.pricePerLitre}
              </p>
            </div>
            <div className="bg-secondary/60 rounded-lg p-2.5 text-center">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Daily Amt</p>
              <p className="font-bold text-foreground text-sm">
                ₹{dailyAmount.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Financial summary */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-2.5 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Total Due
                </p>
                <p className="font-semibold text-foreground text-sm">
                  ₹{customer.totalAmountDue.toFixed(2)}
                </p>
              </div>
              <div className="p-2.5 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Received</p>
                <p className="font-semibold text-success text-sm">
                  ₹{customer.amountReceived.toFixed(2)}
                </p>
              </div>
            </div>
            <div
              className={`p-2.5 text-center border-t border-border ${balance > 0 ? "bg-destructive/10" : "bg-success/10"}`}
            >
              <p className="text-xs text-muted-foreground mb-0.5">
                Balance Due
              </p>
              <p
                className={`font-bold text-base ${balance > 0 ? "text-destructive" : "text-success"}`}
              >
                ₹{balance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Last payment date */}
          {customer.lastPaymentDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarCheck className="h-3.5 w-3.5 text-success" />
              <span>Last payment: {customer.lastPaymentDate}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleRecordDelivery}
              disabled={recordDelivery.isPending || !customer.isActive}
            >
              {recordDelivery.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : deliverySuccess ? (
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-success" />
              ) : (
                <Milk className="h-3.5 w-3.5 mr-1.5" />
              )}
              {deliverySuccess ? "Recorded!" : "Record Delivery"}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setShowPaymentDialog(true)}
              disabled={!customer.isActive}
            >
              <Wallet className="h-3.5 w-3.5 mr-1.5" />
              Record Payment
            </Button>
          </div>

          {/* Daily Orders button */}
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => setShowDailyOrdersDialog(true)}
          >
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
            Daily Orders
          </Button>

          {/* Edit button */}
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => setShowEditDialog(true)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit Details
          </Button>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Record Payment
            </DialogTitle>
            <DialogDescription>
              Enter the amount received and payment date.
            </DialogDescription>
          </DialogHeader>
          <RecordPaymentForm
            customer={customer}
            onClose={() => setShowPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Customer
            </DialogTitle>
            <DialogDescription>
              Update customer details and daily milk order.
            </DialogDescription>
          </DialogHeader>
          <EditCustomerForm
            customer={customer}
            onClose={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Daily Orders Dialog */}
      <DailyOrdersDialog
        customer={customer}
        open={showDailyOrdersDialog}
        onOpenChange={setShowDailyOrdersDialog}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RegularCustomers() {
  const { data: customers, isLoading, error } = useRegularCustomers();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = (customers || []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  const activeCount = (customers || []).filter((c) => c.isActive).length;
  const totalBalance = (customers || []).reduce(
    (sum, c) => sum + (c.totalAmountDue - c.amountReceived),
    0,
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Regular Customers
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage daily milk deliveries and payments
            </p>
          </div>

          {/* Admin-gated content */}
          <AdminGuard>
            {/* Summary stats */}
            {customers && customers.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {customers.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total Customers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-2xl font-bold text-success">
                      {activeCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Active
                    </p>
                  </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                  <CardContent className="pt-4 pb-4 text-center">
                    <p
                      className={`text-2xl font-bold ${totalBalance > 0 ? "text-destructive" : "text-success"}`}
                    >
                      ₹{totalBalance.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total Balance Due
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Inline New Customer Record Panel */}
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setShowInlineForm((v) => !v)}
                data-ocid="customer.open_modal_button"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/15 rounded-md">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-primary">
                          New Customer Record
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Click to {showInlineForm ? "collapse" : "expand"} form
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-primary transition-transform duration-200 ${showInlineForm ? "rotate-180" : ""}`}
                    />
                  </div>
                </CardHeader>
              </button>
              {showInlineForm && (
                <CardContent className="pt-0">
                  <div className="border-t border-primary/20 pt-4">
                    <AddCustomerForm onClose={() => setShowInlineForm(false)} />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
                data-ocid="customer.search_input"
              />
              <Button
                onClick={() => setShowAddDialog(true)}
                data-ocid="customer.secondary_button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load customers. Please refresh the page.
                </AlertDescription>
              </Alert>
            )}

            {/* Empty state */}
            {!isLoading && !error && filtered.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {search ? "No customers found" : "No Customers Yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {search
                      ? "Try a different search term."
                      : "Add your first regular customer to get started."}
                  </p>
                  {!search && (
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Customer
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Customer grid */}
            {!isLoading && !error && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((customer) => (
                  <CustomerCard
                    key={Number(customer.customerId)}
                    customer={customer}
                  />
                ))}
              </div>
            )}
          </AdminGuard>
        </div>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Regular Customer
            </DialogTitle>
            <DialogDescription>
              Enter the customer's details and daily milk order.
            </DialogDescription>
          </DialogHeader>
          <AddCustomerForm onClose={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
