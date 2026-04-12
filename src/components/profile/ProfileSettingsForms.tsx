"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { toast } from "sonner";

import {
  updateDefaultShippingAddressAction,
  updateDisplayNameAction,
} from "@/app/profile/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const accountSettingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(80, "Display name must be 80 characters or less."),
});

const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name must be 80 characters or less."),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits.")
    .max(24, "Phone number must be 24 characters or less."),
  line1: z
    .string()
    .trim()
    .min(5, "Address line 1 must be at least 5 characters.")
    .max(140, "Address line 1 must be 140 characters or less."),
  line2: z
    .string()
    .trim()
    .max(140, "Address line 2 must be 140 characters or less.")
    .optional()
    .default(""),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters.")
    .max(80, "City must be 80 characters or less."),
  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters.")
    .max(80, "State must be 80 characters or less."),
  postalCode: z
    .string()
    .trim()
    .min(4, "Postal code must be at least 4 characters.")
    .max(12, "Postal code must be 12 characters or less."),
  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters.")
    .max(56, "Country must be 56 characters or less."),
});

type AccountInputValues = z.input<typeof accountSettingsSchema>;
type AccountValues = z.output<typeof accountSettingsSchema>;
type AddressInputValues = z.input<typeof addressSchema>;
type AddressValues = z.output<typeof addressSchema>;

type FormFeedback = {
  status: "success" | "error";
  message: string;
};

export type ProfileAddressDraft = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function ProfileSettingsForms({
  initialDisplayName,
  initialEmail,
  initialAddress,
}: {
  initialDisplayName: string;
  initialEmail: string;
  initialAddress: ProfileAddressDraft;
}) {
  const [accountFeedback, setAccountFeedback] = useState<FormFeedback | null>(null);
  const [addressFeedback, setAddressFeedback] = useState<FormFeedback | null>(null);
  const [isSavingAccount, startSavingAccount] = useTransition();
  const [isSavingAddress, startSavingAddress] = useTransition();

  const accountForm = useForm<AccountInputValues, unknown, AccountValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      displayName: initialDisplayName || "",
    },
  });

  const addressForm = useForm<AddressInputValues, unknown, AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialAddress.fullName || "",
      phone: initialAddress.phone || "",
      line1: initialAddress.line1 || "",
      line2: initialAddress.line2 || "",
      city: initialAddress.city || "",
      state: initialAddress.state || "",
      postalCode: initialAddress.postalCode || "",
      country: initialAddress.country || "",
    },
  });

  const submitAccountSettings = (values: AccountValues) => {
    startSavingAccount(async () => {
      const result = await updateDisplayNameAction(values);
      setAccountFeedback(result);

      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const submitAddress = (values: AddressValues) => {
    startSavingAddress(async () => {
      const result = await updateDefaultShippingAddressAction(values);
      setAddressFeedback(result);

      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <section
        id="saved-addresses"
        className="scroll-mt-32 rounded-[1.55rem] border border-[rgba(139,38,62,0.12)] bg-[#FDF8F4] p-6 shadow-[0_18px_50px_rgba(139,38,62,0.08)] md:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Saved Addresses
            </p>
            <h3 className="mt-2 font-heading text-3xl tracking-tight">Default Shipping Address</h3>
            <p className="mt-2 font-sans text-sm text-foreground/70">
              This address is used as your default at checkout.
            </p>
          </div>
        </div>

        <Form {...addressForm}>
          <form className="space-y-4" onSubmit={addressForm.handleSubmit(submitAddress)}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={addressForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={addressForm.control}
              name="line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Apartment, house number, street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={addressForm.control}
              name="line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Area, landmark" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={addressForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Bengaluru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Karnataka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={addressForm.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="560001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="India" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={isSavingAddress}>
                <Save className="h-4 w-4" />
                {isSavingAddress ? "Saving..." : "Save Address"}
              </Button>
              {addressFeedback ? (
                <p
                  className={`font-sans text-sm ${
                    addressFeedback.status === "error" ? "text-destructive" : "text-foreground/70"
                  }`}
                >
                  {addressFeedback.message}
                </p>
              ) : null}
            </div>
          </form>
        </Form>
      </section>

      <section
        id="account-settings"
        className="scroll-mt-32 rounded-[1.55rem] border border-[rgba(139,38,62,0.12)] bg-[#FDF8F4] p-6 shadow-[0_18px_50px_rgba(139,38,62,0.08)] md:p-7"
      >
        <div className="mb-5">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Account Settings
          </p>
          <h3 className="mt-2 font-heading text-3xl tracking-tight">Personal Details</h3>
          <p className="mt-2 font-sans text-sm text-foreground/70">
            Manage the name shown across your orders and account.
          </p>
        </div>

        <Form {...accountForm}>
          <form className="space-y-4" onSubmit={accountForm.handleSubmit(submitAccountSettings)}>
            <FormField
              control={accountForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Email</p>
              <Input value={initialEmail} readOnly className="bg-card/50 text-foreground/75" />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={isSavingAccount}>
                <Save className="h-4 w-4" />
                {isSavingAccount ? "Saving..." : "Save Changes"}
              </Button>
              {accountFeedback ? (
                <p
                  className={`font-sans text-sm ${
                    accountFeedback.status === "error" ? "text-destructive" : "text-foreground/70"
                  }`}
                >
                  {accountFeedback.message}
                </p>
              ) : null}
            </div>
          </form>
        </Form>
      </section>
    </>
  );
}
