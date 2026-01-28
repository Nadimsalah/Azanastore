"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ContactMessage, listContactMessages } from "@/lib/supabase-api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function AdminContactsPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"
  const [rows, setRows] = useState<ContactMessage[]>([])
  const [active, setActive] = useState<ContactMessage | null>(null)

  useEffect(() => {
    listContactMessages().then(setRows).catch(console.error)
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
            {isArabic ? "رسائل اتصل بنا" : "Contact messages"}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Card className="p-4 sm:p-6">
          <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {isArabic ? "رسائل العملاء والشركاء" : "Messages from clients, partners & distributors"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            {isArabic
              ? "يمكنك عرض نص الرسالة كاملًا بالضغط على زر \"عرض\"."
              : "Click the \"View\" button to read full message content in a dialog."}
          </p>
        </Card>

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? "الاسم" : "Name"}</TableHead>
                <TableHead>{isArabic ? "البريد" : "Email"}</TableHead>
                <TableHead>{isArabic ? "الموبايل" : "Phone"}</TableHead>
                <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                <TableHead>{isArabic ? "الرسالة" : "Message"}</TableHead>
                <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    {isArabic
                      ? "لا توجد رسائل بعد. اربط صفحة اتصل بنا بقاعدة البيانات لعرض الرسائل هنا."
                      : "No messages yet. Connect the Contact Us form to a database to see messages here."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {row.message}
                        </p>
                        <Dialog open={active?.id === row.id} onOpenChange={(open) => setActive(open ? row : null)}>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap"
                            onClick={() => setActive(row)}
                          >
                            {isArabic ? "عرض" : "View"}
                          </Button>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle>
                                {isArabic ? "تفاصيل الرسالة" : "Message details"}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 text-sm">
                              <p><strong>{isArabic ? "الاسم:" : "Name:"}</strong> {row.name}</p>
                              {row.email && <p><strong>{isArabic ? "البريد:" : "Email:"}</strong> {row.email}</p>}
                              <p><strong>{isArabic ? "الموبايل:" : "Phone:"}</strong> {row.phone}</p>
                              {row.company && <p><strong>{isArabic ? "الشركة:" : "Company:"}</strong> {row.company}</p>}
                              {row.type && <p><strong>{isArabic ? "النوع:" : "Type:"}</strong> {row.type}</p>}
                              <p className="mt-4 whitespace-pre-line break-words">
                                {row.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-3">
                                {new Date(row.created_at).toLocaleString()}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
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

