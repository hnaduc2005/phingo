"use client";

import React, { useEffect, useState } from "react";
import { Search, Mail, Phone, Calendar, CheckCircle, Clock, Archive } from "lucide-react";
import { apiFetch } from "@/lib/api";

type ContactMessage = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: string;
};

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await apiFetch<any>("/api/admin/contact-messages");
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/admin/contact-messages/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setMessages(messages.map(m => m.id === id ? { ...m, status: status as any } : m));
    } catch (err) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium border border-amber-200">Mới</span>;
      case "READ": return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">Đã xem</span>;
      case "REPLIED": return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Đã trả lời</span>;
      case "ARCHIVED": return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium border border-gray-200">Lưu trữ</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tin nhắn liên hệ</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, sđt, email..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-mustard"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Khách hàng</th>
                <th className="px-6 py-4 font-medium">Liên hệ</th>
                <th className="px-6 py-4 font-medium">Nội dung</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Không có tin nhắn nào</p>
                  </td>
                </tr>
              ) : messages.map((msg) => (
                <tr key={msg.id} className={`hover:bg-gray-50/50 transition-colors ${msg.status === 'NEW' ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-900">{msg.name}</div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1 text-gray-600">
                      {msg.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" />
                          <a href={`tel:${msg.phone}`} className="hover:text-brand-mustard">{msg.phone}</a>
                        </div>
                      )}
                      {msg.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          <a href={`mailto:${msg.email}`} className="hover:text-brand-mustard">{msg.email}</a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-sm align-top">
                    {msg.subject && <div className="font-medium text-gray-900 mb-1">{msg.subject}</div>}
                    <div className="text-gray-600 line-clamp-2">{msg.message}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {getStatusBadge(msg.status)}
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                      {msg.status !== 'READ' && msg.status !== 'REPLIED' && (
                        <button onClick={() => updateStatus(msg.id, 'READ')} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="Đánh dấu đã đọc">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {msg.status !== 'REPLIED' && (
                        <button onClick={() => updateStatus(msg.id, 'REPLIED')} className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Đánh dấu đã trả lời">
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {msg.status !== 'ARCHIVED' && (
                        <button onClick={() => updateStatus(msg.id, 'ARCHIVED')} className="p-1.5 text-gray-400 hover:text-gray-600 rounded" title="Lưu trữ">
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
