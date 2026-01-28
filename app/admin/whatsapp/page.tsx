"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Phone, Inbox } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { listWhatsappSubscriptions, WhatsappSubscription } from "@/lib/supabase-api"

export default function AdminWhatsappPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"
  const [leads, setLeads] = useState<WhatsappSubscription[]>([])

  useEffect(() => {
    listWhatsappSubscriptions().then(setLeads).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isArabic ? "العودة للوحة التحكم" : "Back to dashboard"}</span>
          </Link>
          <span className="text-xs text-muted-foreground uppercase tracking-[0.25em]">
            {isArabic ? "أرقام واتساب" : "WhatsApp Leads"}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Card className="p-4 sm:p-6 flex items-center justify-between gap-4">
          <div className={isArabic ? "text-right space-y-1" : "space-y-1"}>
            <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              {isArabic ? "قائمة المشتركين في واتساب" : "WhatsApp subscription list"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isArabic
                ? "هذه الصفحة مبدئية لعرض أرقام \"خليك على تواصل عبر واتساب\". يمكن ربطها لاحقاً بقاعدة بيانات Supabase."
                : "This page is a placeholder to display numbers from the \"Stay in the Loop on WhatsApp\" form. You can later connect it to a Supabase table."}
            </p>
          </div>
          <Button variant="outline" size="icon" className="rounded-full" disabled>
            <Inbox className="w-4 h-4" />
          </Button>
        </Card>

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? "الدولة" : "Country code"}</TableHead>
                <TableHead>{isArabic ? "رقم الموبايل" : "Phone"}</TableHead>
                <TableHead>{isArabic ? "تاريخ التسجيل" : "Subscribed at"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground text-sm">
                    {isArabic
                      ? "لا توجد بيانات بعد. اربط النموذج بقاعدة البيانات لعرض الأرقام هنا."
                      : "No data yet. Connect the WhatsApp form to a database to see numbers here."}
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.country_code}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{new Date(lead.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  )
}

