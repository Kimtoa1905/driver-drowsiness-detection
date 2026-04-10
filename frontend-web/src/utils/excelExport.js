import * as XLSX from 'xlsx';

export const exportToExcel = (logs, fileName = 'Bao_Cao_Vi_Pham_Dermify') => {
  if (!logs || logs.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  // 1. Chuẩn bị dữ liệu và Việt hóa tiêu đề cột
  const dataToExport = logs.map((log, index) => ({
    "STT": index + 1,
    "ID HỆ THỐNG": log.id,
    "THỜI GIAN GHI NHẬN": log.time,
    "LOẠI VI PHẠM": log.status === "TEST_MODE" ? "Phát hiện vật thể lạ" : "Sử dụng điện thoại",
    "TÊN TỆP ẢNH": log.image,
    "GHI CHÚ": "" 
  }));

  // 2. Tạo worksheet từ JSON
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);

  // 3. Tối ưu độ rộng cột (Auto-fit căn bản)
  // Giúp file Excel mở lên trên điện thoại/máy tính bảng không bị tràn chữ
  const wscols = [
    { wch: 6 },  // STT
    { wch: 20 }, // ID
    { wch: 25 }, // Thời gian
    { wch: 25 }, // Loại vi phạm
    { wch: 30 }, // Tên file ảnh
    { wch: 15 }, // Ghi chú
  ];
  worksheet['!cols'] = wscols;

  // 4. Tạo workbook và xuất file
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachViPham");

  // Đặt tên file có ngày tháng rõ ràng
  const timestamp = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
  XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
};