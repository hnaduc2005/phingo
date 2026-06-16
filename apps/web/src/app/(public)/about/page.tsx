import Image from "next/image";

import { imageAssets } from "@/config/images";

export const metadata = {
  title: "Về PHIN GO",
  description: "Câu chuyện và sứ mệnh của thương hiệu cà phê phin giấy PHIN GO.",
};

export default function AboutPage() {
  return (
    <div className="bg-brand-cream pb-24">
      <section className="relative flex h-[60vh] min-h-[500px] items-center justify-center overflow-hidden">
        <Image src={imageAssets.showroom} alt="Về PHIN GO" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-brand-coffee/70" />
        <div className="relative z-10 px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold text-brand-cream md:text-6xl">
            Câu chuyện <span className="text-brand-mustard text-glow">PHIN GO</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-brand-beige/90">
            Khơi nguồn cảm hứng từ nét văn hóa cà phê phin đậm đà của người Việt.
          </p>
        </div>
      </section>

      <section className="container relative z-20 mx-auto -mt-20 px-4">
        <div className="mx-auto max-w-5xl rounded-[3rem] border border-brand-coffee/5 bg-white p-8 shadow-xl md:p-16">
          <div className="grid gap-16 md:grid-cols-2">
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-3xl font-bold text-brand-coffee">Sứ mệnh của chúng tôi</h2>
                <p className="text-lg leading-relaxed text-brand-coffee/80">
                  PHIN GO lưu giữ và lan tỏa hương vị cà phê phin truyền thống đến với nhịp sống hiện đại.
                  Mỗi sản phẩm là sự giao thoa giữa tinh thần cà phê Việt và sự tiện lợi cho người bận rộn.
                </p>
              </div>

              <div>
                <h2 className="mb-4 text-3xl font-bold text-brand-coffee">Tầm nhìn</h2>
                <p className="text-lg leading-relaxed text-brand-coffee/80">
                  Trở thành thương hiệu cà phê phin giấy hàng đầu Việt Nam, đồng hành cùng khách hàng ở văn phòng,
                  tại nhà và trong những chuyến đi xa.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="mb-4 text-3xl font-bold text-brand-coffee">Giá trị cốt lõi</h2>
              <div className="space-y-6">
                {[
                  ["Chất lượng", "Tuyển chọn hạt cà phê tốt và kiểm soát trải nghiệm pha ổn định."],
                  ["Tiện dụng", "Thiết kế phin giấy dễ mang theo, dễ pha và phù hợp nhiều bối cảnh."],
                  ["Bản sắc", "Giữ lại tinh thần thưởng thức cà phê phin trong một hình thức hiện đại."],
                ].map(([title, description]) => (
                  <div key={title} className="glass-panel rounded-2xl border-l-4 border-l-brand-mustard p-6">
                    <h3 className="mb-2 text-xl font-bold text-brand-coffee">{title}</h3>
                    <p className="text-brand-coffee/70">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
