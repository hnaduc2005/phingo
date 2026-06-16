"use client";

import { CheckCircle2, Copy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export type BankTransferInfoCardProps = {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  qrImageUrl?: string;
  transferContent: string;
  paymentStatus?: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
};

export function BankTransferInfoCard({
  amount,
  bankName,
  bankAccountNumber,
  bankAccountHolder,
  qrImageUrl,
  transferContent,
  paymentStatus,
}: BankTransferInfoCardProps) {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  async function copyToClipboard(text: string, type: "account" | "content" | "amount") {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "account") {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
      } else if (type === "content") {
        setCopiedContent(true);
        setTimeout(() => setCopiedContent(false), 2000);
      } else {
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl border border-brand-coffee/10 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-brand-coffee">Thông tin chuyển khoản</h3>
        {paymentStatus ? (
          <Badge variant={paymentStatus === "PAID" ? "default" : paymentStatus === "PENDING" ? "secondary" : "outline"}>
            {paymentStatus === "PAID" ? "Đã thanh toán" : paymentStatus === "PENDING" ? "Đang chờ xác nhận" : paymentStatus}
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-xl bg-brand-cream/50 p-4">
          {qrImageUrl ? (
            <div className="relative aspect-square w-full max-w-[180px] overflow-hidden rounded-lg bg-white p-2">
              <Image
                src={qrImageUrl}
                alt="QR Code Chuyển Khoản"
                fill
                className="object-contain"
                unoptimized={qrImageUrl.startsWith("http")}
              />
            </div>
          ) : (
            <div className="flex aspect-square w-full max-w-[180px] items-center justify-center rounded-lg border-2 border-dashed border-brand-coffee/20 bg-white p-4 text-center text-sm text-brand-coffee/50">
              Mã QR chưa được cấu hình
            </div>
          )}
          <p className="text-center text-xs text-brand-coffee/60">Quét mã bằng ứng dụng ngân hàng</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-brand-cream/30 p-3">
              <p className="mb-1 text-xs text-brand-coffee/60">Ngân hàng</p>
              <p className="font-semibold text-brand-coffee">{bankName || "Chưa cập nhật"}</p>
            </div>
            <div className="rounded-lg bg-brand-cream/30 p-3">
              <p className="mb-1 text-xs text-brand-coffee/60">Chủ tài khoản</p>
              <p className="font-semibold text-brand-coffee">{bankAccountHolder || "Chưa cập nhật"}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-brand-cream/30 p-3">
            <div>
              <p className="mb-1 text-xs text-brand-coffee/60">Số tài khoản</p>
              <p className="font-bold tracking-wider text-brand-coffee">{bankAccountNumber || "Chưa cập nhật"}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-brand-coffee hover:bg-brand-coffee/10"
              onClick={() => copyToClipboard(bankAccountNumber, "account")}
            >
              {copiedAccount ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-brand-cream/30 p-3">
            <div>
              <p className="mb-1 text-xs text-brand-coffee/60">Số tiền cần chuyển</p>
              <p className="text-lg font-bold text-brand-mustard">{formatCurrency(amount)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-brand-coffee hover:bg-brand-coffee/10"
              onClick={() => copyToClipboard(amount.toString(), "amount")}
            >
              {copiedAmount ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border-2 border-brand-mustard/20 bg-brand-mustard/5 p-4">
            <div>
              <p className="mb-1 text-xs font-medium text-brand-coffee/70">Nội dung chuyển khoản</p>
              <p className="font-bold text-brand-coffee">{transferContent}</p>
            </div>
            <Button
              variant="premium"
              size="sm"
              onClick={() => copyToClipboard(transferContent, "content")}
            >
              {copiedContent ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy
            </Button>
          </div>

          <p className="mt-4 text-sm italic text-brand-coffee/70">
            * Vui lòng chuyển đúng số tiền và nội dung chuyển khoản để hệ thống xác nhận đơn hàng nhanh nhất.
          </p>
        </div>
      </div>
    </div>
  );
}
