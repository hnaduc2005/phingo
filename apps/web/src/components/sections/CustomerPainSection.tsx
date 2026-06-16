import { Clock, Laptop, Plane, Users } from "lucide-react";

const audiences = [
  {
    icon: Laptop,
    title: "Nhân viên văn phòng",
    desc: "Cần sự tỉnh táo để làm việc nhưng không có nhiều thời gian pha phin hoặc ra ngoài mua.",
  },
  {
    icon: Plane,
    title: "Người hay di chuyển",
    desc: "Công tác, du lịch thường xuyên và muốn có ly cà phê đúng gu mọi lúc mọi nơi.",
  },
  {
    icon: Clock,
    title: "Người bận rộn",
    desc: "Yêu hương vị truyền thống nhưng cần một cách pha gọn gàng, nhanh và ổn định.",
  },
  {
    icon: Users,
    title: "Sinh viên",
    desc: "Cần thức uống chất lượng với chi phí hợp lý để học tập và giữ nhịp trong ngày dài.",
  },
];

export function CustomerPainSection() {
  return (
    <section className="bg-brand-warm-white py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-brand-coffee">Giải pháp cho nhịp sống hiện đại</h2>
          <p className="text-lg text-brand-coffee/70">
            PHIN GO giúp bạn giữ hương vị cà phê phin quen thuộc trong một trải nghiệm nhanh, sạch và dễ mang theo.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass-panel group rounded-3xl p-8 text-center transition-all hover:bg-white/90">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold transition-all group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-white">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-coffee">{item.title}</h3>
                <p className="text-sm leading-relaxed text-brand-coffee/60">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
