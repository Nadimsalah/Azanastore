"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Briefcase } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CareerApplication, listCareerApplications } from "@/lib/supabase-api"

export default function AdminCareersPage() {
  const { language } = useLanguage()
  const isArabic = language === "ar"
  const [rows, setRows] = useState<CareerApplication[]>([])
  const [active, setActive] = useState<CareerApplication | null>(null)

  useEffect(() => {
    listCareerApplications().then(setRows).catch(console.error)
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
            {isArabic ? "طلبات التوظيف" : "Career applications"}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Card className="p-4 sm:p-6">
          <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            {isArabic ? "طلبات الانضمام إلى الفريق" : "Applications to join the team"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            {isArabic
              ? "يمكنك عرض نص النبذة كاملة بالضغط على زر \"عرض\" لكل طلب."
              : "Click the \"View\" button on each row to read the full application summary in a dialog."}
          </p>
        </Card>

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? "الاسم" : "Name"}</TableHead>
                <TableHead>{isArabic ? "البريد" : "Email"}</TableHead>
                <TableHead>{isArabic ? "الموبايل" : "Phone"}</TableHead>
                <TableHead>{isArabic ? "الوظيفة" : "Role"}</TableHead>
                <TableHead>{isArabic ? "اسم ملف الـ CV" : "CV file"}</TableHead>
                <TableHead>{isArabic ? "نبذة" : "Summary"}</TableHead>
                <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                    {isArabic
                      ? "لا توجد طلبات بعد. اربط صفحة الوظائف بقاعدة البيانات لعرض الطلبات هنا."
                      : "No applications yet. Connect the Careers form to a database to see applications here."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>
                      {row.cv_file_name ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${row.cv_file_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline"
                        >
                          {isArabic ? "فتح الملف" : "Open CV"}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {isArabic ? "لا يوجد ملف" : "No file"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {row.summary}
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
                                {isArabic ? "تفاصيل طلب التوظيف" : "Application details"}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 text-sm">
                              <p><strong>{isArabic ? "الاسم:" : "Name:"}</strong> {row.name}</p>
                              <p><strong>{isArabic ? "البريد:" : "Email:"}</strong> {row.email}</p>
                              <p><strong>{isArabic ? "الموبايل:" : "Phone:"}</strong> {row.phone}</p>
                              <p><strong>{isArabic ? "الوظيفة:" : "Role:"}</strong> {row.role}</p>
                              {row.cv_file_name && (
                                <p><strong>{isArabic ? "ملف الـ CV:" : "CV file:"}</strong> {row.cv_file_name}</p>
                              )}
                              <p className="mt-4 whitespace-pre-line break-words">
                                {row.summary}
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

