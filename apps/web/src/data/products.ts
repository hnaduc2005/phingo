import { imageAssets } from "@/config/images";

export type Product = {
  id: string;
  name: string;
  slug: string;
  flavor: string;
  price: number;
  packageInfo: string;
  shortDescription: string;
  description: string;
  image: string;
  accentColor: string;
  features: string[];
};

export const products: Product[] = [
  {
    id: "original",
    name: "Original",
    slug: "original",
    flavor: "Hương vị hài hòa, dễ uống",
    price: 75000,
    packageInfo: "Hộp 10 gói",
    shortDescription: "Sự kết hợp hoàn hảo mang đến hương vị hài hòa, dễ uống với hậu vị ngọt nhẹ đặc trưng.",
    description: "PHIN GO Original là dòng sản phẩm cơ bản dành cho mọi tín đồ cà phê. Với sự cân bằng hoàn hảo giữa vị đắng nhẹ và hậu vị ngọt thanh, sản phẩm giúp bạn bắt đầu ngày mới đầy hứng khởi mà không quá gắt.",
    image: imageAssets.productOriginal,
    accentColor: "bg-amber-500", // vàng/mustard
    features: [
      "Hậu vị ngọt nhẹ",
      "Thơm dịu, dễ uống",
      "Phù hợp uống nóng hoặc đá",
    ]
  },
  {
    id: "bold-robusta",
    name: "Bold Robusta",
    slug: "bold-robusta",
    flavor: "Đậm đà, mạnh mẽ",
    price: 90000,
    packageInfo: "Hộp 10 gói",
    shortDescription: "Hương thơm nồng, vị cà phê rõ nét dành cho những người yêu thích sự đậm đà mạnh mẽ.",
    description: "Được tuyển chọn từ những hạt Robusta chất lượng cao, Bold Robusta mang đến hương vị cà phê đậm chất Việt Nam. Vị đắng mạnh mẽ, hương thơm nồng nàn giúp đánh thức sự tập trung tức thì.",
    image: imageAssets.productBoldRobusta,
    accentColor: "bg-emerald-800", // xanh lá đậm
    features: [
      "Đậm vị cà phê truyền thống",
      "Hương thơm nồng nàn",
      "Giúp tỉnh táo tối đa",
    ]
  },
  {
    id: "smooth-arabica",
    name: "Smooth Arabica",
    slug: "smooth-arabica",
    flavor: "Hương thơm thanh lịch",
    price: 100000,
    packageInfo: "Hộp 10 gói",
    shortDescription: "Hương thơm thanh lịch, vị chua nhẹ đặc trưng với hậu vị mượt mà, tinh tế.",
    description: "Dành cho những tâm hồn tinh tế, Smooth Arabica nổi bật với vị chua thanh nhẹ nhàng của trái cây nhiệt đới, kết hợp cùng hương thơm quyến rũ. Hậu vị mượt mà kéo dài tạo nên trải nghiệm thưởng thức đẳng cấp.",
    image: imageAssets.productSmoothArabica,
    accentColor: "bg-blue-700", // xanh dương
    features: [
      "Vị chua thanh tinh tế",
      "Hương thơm hoa cỏ",
      "Hậu vị cực kỳ mượt mà",
    ]
  }
];
