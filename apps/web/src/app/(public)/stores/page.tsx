"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StoreLocation = {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  district: string;
  ward: string | null;
  phone: string | null;
  openingHours: string | null;
  googleMapUrl: string | null;
};

export default function StoresPage() {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchStores();
  }, [filterType, filterCity, keyword]);

  const fetchStores = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (filterType) query.append("type", filterType);
      if (filterCity) query.append("city", filterCity);
      if (keyword.trim()) query.append("keyword", keyword.trim());
      
      const res = await apiFetch<ApiResponse<StoreLocation[]>>(`/api/stores?${query.toString()}`);
      const loadedStores = res.data ?? [];
      setStores(loadedStores);
      
      if (!filterCity && cities.length === 0) {
         setCities(Array.from(new Set(loadedStores.map(s => s.city))));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const getStoreTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      SHOWROOM: "Showroom",
      DEALER: "Đại lý",
      CONVENIENCE_STORE: "Cửa hàng tiện lợi",
      COFFEE_SHOP: "Quán cà phê",
      GROCERY: "Tạp hóa",
    };
    return types[type] || type;
  };

  const getStoreTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SHOWROOM: "mustard",
      DEALER: "blue",
      CONVENIENCE_STORE: "green",
      COFFEE_SHOP: "outline",
      GROCERY: "outline",
    };
    return (colors[type] || "default") as any;
  };

  return (
    <div className="bg-brand-cream min-h-screen pb-24">
      {/* Hero Section */}
      <section className="bg-brand-coffee text-brand-cream py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tìm điểm bán PHIN GO gần bạn</h1>
          <p className="text-lg text-brand-beige/80 max-w-2xl mx-auto">
            Mua PHIN GO tại showroom, đại lý, cửa hàng tiện lợi, quán cà phê và các điểm bán liên kết.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="container mx-auto px-4 mt-8 mb-8">
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-brand-coffee/10">
          <input
            className="flex-[2] min-w-[240px] p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-mustard text-brand-coffee bg-white"
            placeholder="Tìm theo tên, địa chỉ, quận/huyện..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select 
            className="flex-1 min-w-[200px] p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-mustard text-brand-coffee bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tất cả loại điểm bán</option>
            <option value="SHOWROOM">Showroom</option>
            <option value="DEALER">Đại lý</option>
            <option value="CONVENIENCE_STORE">Cửa hàng tiện lợi</option>
            <option value="COFFEE_SHOP">Quán cà phê</option>
            <option value="GROCERY">Tạp hóa</option>
          </select>
          
          <select 
            className="flex-1 min-w-[200px] p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-mustard text-brand-coffee bg-white"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          >
            <option value="">Tất cả khu vực</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl animate-pulse h-48" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-red-50 p-6 rounded-xl border border-red-200">
            {error}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-brand-coffee/5">
            <MapPin className="w-12 h-12 text-brand-coffee/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-coffee mb-2">Không tìm thấy điểm bán phù hợp</h3>
            <p className="text-brand-coffee/70">
              Hiện chưa có điểm bán phù hợp. Vui lòng thử khu vực khác hoặc liên hệ PHIN GO để được hỗ trợ.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-brand-coffee/5 relative flex flex-col h-full">
                <div className="mb-4">
                  <Badge variant={getStoreTypeColor(store.type)} className="mb-2">
                    {getStoreTypeLabel(store.type)}
                  </Badge>
                  <h3 className="text-xl font-bold text-brand-coffee">{store.name}</h3>
                </div>
                
                <div className="space-y-3 flex-1 text-brand-coffee/80 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-mustard" />
                    <span>{store.address}, {store.ward ? store.ward + ', ' : ''}{store.district}, {store.city}</span>
                  </div>
                  {store.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 flex-shrink-0 text-brand-mustard" />
                      <a href={`tel:${store.phone}`} className="hover:text-brand-mustard font-medium">{store.phone}</a>
                    </div>
                  )}
                  {store.openingHours && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 flex-shrink-0 text-brand-mustard" />
                      <span>{store.openingHours}</span>
                    </div>
                  )}
                </div>

                {(store.phone || store.googleMapUrl) && (
                  <div className="mt-6 pt-4 border-t border-brand-coffee/10 flex flex-wrap gap-3">
                    {store.phone && (
                      <a
                        href={`tel:${store.phone}`}
                        className="inline-flex items-center justify-center gap-2 text-brand-coffee bg-brand-mustard/15 hover:bg-brand-mustard/25 font-medium px-4 py-2 rounded-lg flex-1 transition-colors text-sm"
                      >
                        <Phone className="w-4 h-4" /> Gọi ngay
                      </a>
                    )}
                    {store.googleMapUrl && (
                    <a 
                      href={store.googleMapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-brand-coffee bg-brand-coffee/5 hover:bg-brand-coffee/10 font-medium px-4 py-2 rounded-lg flex-1 transition-colors text-sm"
                    >
                      Xem bản đồ <ExternalLink className="w-4 h-4" />
                    </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
