import type { Database } from "@/lib/supabase/types";

type SubscriberInsert = Database["public"]["Tables"]["newsletter_subscribers"]["Insert"];

type SubscriberRow = {
  email: string | null;
};

type SubscriberQueryError = {
  code?: string;
  message: string;
} | null;

type SubscriberReadClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        not: (
          column: string,
          operator: string,
          value: null
        ) => Promise<{ data: SubscriberRow[] | null; error: SubscriberQueryError }>;
      };
    };
  };
};

type SubscriberWriteClient = {
  from: (table: string) => {
    insert: (values: SubscriberInsert) => Promise<{ error: SubscriberQueryError }>;
  };
};

export async function fetchSubscribedNewsletterEmails(supabase: unknown) {
  const { data, error } = await (supabase as SubscriberReadClient)
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "subscribed")
    .not("email", "is", null);

  const emails = (data ?? [])
    .map((row) => row.email)
    .filter((value): value is string => Boolean(value));

  return {
    emails,
    error,
  };
}

export async function insertNewsletterSubscriber(supabase: unknown, values: SubscriberInsert) {
  return (supabase as SubscriberWriteClient)
    .from("newsletter_subscribers")
    .insert(values);
}
