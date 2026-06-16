import React from "react"
import { Coffee, Zap, DollarSign, MapPin } from "lucide-react"

const reasons = [
  {
    title: "Chất lượng nguyên bản",
    description: "Giữ trọn vẹn hương vị tinh túy của ly cà phê phin Việt Nam truyền thống.",
    icon: Coffee,
    color: "bg-brand-coffee text-white"
  },
  {
    title: "Tiện lợi tối đa",
    description: "Không cần dụng cụ pha chế phức tạp, chỉ cần nước sôi và 3 phút.",
    icon: Zap,
    color: "bg-brand-mustard text-white"
  },
  {
    title: "Tiết kiệm chi phí",
    description: "Giải pháp kinh tế hơn so với mua cà phê ngoài tiệm mỗi ngày.",
    icon: DollarSign,
    color: "bg-brand-green text-white"
  },
  {
    title: "Linh hoạt mọi nơi",
    description: "Dễ dàng thưởng thức tại văn phòng, khi đi du lịch hay công tác.",
    icon: MapPin,
    color: "bg-brand-blue text-white"
  }
]

export function WhyChooseSection() {
  return (
    <section className="py-24 bg-brand-cream relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-brand-coffee mb-4">
            Tại sao chọn PHIN GO?
          </h2>
          <p className="text-brand-coffee/70 text-lg">
            Sự kết hợp hoàn hảo giữa hương vị truyền thống và phong cách sống hiện đại.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-coffee/5 hover:-translate-y-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${reason.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-brand-coffee mb-3">
                  {reason.title}
                </h3>
                <p className="text-brand-coffee/70 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
