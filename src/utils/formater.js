export const slugify = (val) => {
  if (!val) return ''

  return String(val)
    .normalize('NFKD') // Tách dấu ra khỏi chữ (e.g. ế -> e + ◌̂)
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, 'd') // Chuyển đ/Đ thành d
    .toLowerCase() // Viết thường toàn bộ
    .trim() // Bỏ khoảng trắng đầu/cuối
    .replace(/[^a-z0-9\s-]/g, '') // Bỏ ký tự đặc biệt trừ space và -
    .replace(/\s+/g, '-') // space -> -
    .replace(/-+/g, '-') // Bỏ dấu -- thừa
    .replace(/^-+|-+$/g, '') // Bỏ dấu - ở đầu/cuối nếu có
}
