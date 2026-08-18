import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Reveal from "../components/Reveal";

const EMPTY_BOOK_FORM = { title: "", author: "", year: "", quantity: "", category_id: "" };
const EMPTY_CATEGORY_FORM = { name: "", description: "" };

/**
 * AdminPage — quản trị thư viện (CHỈ admin, role từ JWT/API /me).
 * - Tab Sách    : thêm / sửa / xoá sách
 * - Tab Thể loại: thêm thể loại mới
 * Mọi thao tác gọi thẳng API thật của backend.
 */
export default function AdminPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("books");

  // Chờ AuthProvider nạp xong user rồi mới quyết định hiển thị
  if (loading) {
    return (
      <section className="admin-page">
        <div className="container">
          <p className="books-page__empty">Đang kiểm tra quyền truy cập...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="admin-page">
        <div className="container">
          <div className="borrows-page__empty-state">
            <span className="section-label">Quản trị</span>
            <h1 className="borrows-page__title">Bạn cần đăng nhập</h1>
            <Link to="/login" className="btn btn--primary">
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (user.role !== "admin") {
    return (
      <section className="admin-page">
        <div className="container">
          <div className="borrows-page__empty-state">
            <span className="section-label">Quản trị</span>
            <h1 className="borrows-page__title">Không có quyền truy cập</h1>
            <p className="borrows-page__description">
              Trang quản trị chỉ dành cho thủ thư (tài khoản admin).{" "}
              <Link to="/books" className="auth-card__link">Quay lại kho sách</Link>.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="container">
        <Reveal direction="up">
          <div className="borrows-page__header">
            <span className="section-label">Bảng điều khiển thủ thư</span>
            <h1 className="borrows-page__title">
              Quản trị <span className="text-gradient">thư viện</span>
            </h1>
            <p className="borrows-page__description">
              Xin chào, {user.full_name}. Quản lý kho sách và thể loại tại đây.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <div className="admin-page__tabs">
            <button
              type="button"
              className={`admin-page__tab ${tab === "books" ? "admin-page__tab--active" : ""}`}
              onClick={() => setTab("books")}
            >
              Quản lý sách
            </button>
            <button
              type="button"
              className={`admin-page__tab ${tab === "categories" ? "admin-page__tab--active" : ""}`}
              onClick={() => setTab("categories")}
            >
              Quản lý thể loại
            </button>
          </div>
        </Reveal>

        {tab === "books" ? <ManageBooks /> : <ManageCategories />}
      </div>
    </section>
  );
}

/* ==================== Quản lý sách ==================== */

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_BOOK_FORM);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadData = useCallback(async () => {
    const [bookData, categoryData] = await Promise.all([
      api.getBooks(),
      api.getCategories(),
    ]);
    setBooks(bookData);
    setCategories(categoryData);
  }, []);

  useEffect(() => {
    loadData().catch((err) => setNotice({ type: "error", text: err.message }));
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      year: Number(form.year),
      quantity: Number(form.quantity),
      category_id: Number(form.category_id),
    };
    try {
      if (editingId) {
        await api.updateBook(editingId, payload);
        setNotice({ type: "success", text: "Cập nhật sách thành công." });
      } else {
        await api.createBook(payload);
        setNotice({ type: "success", text: "Thêm sách thành công." });
      }
      setForm(EMPTY_BOOK_FORM);
      setEditingId(null);
      loadData();
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  const startEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      year: String(book.year),
      quantity: String(book.quantity),
      category_id: String(book.category_id),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Xoá sách "${book.title}"?`)) return;
    setNotice(null);
    try {
      await api.deleteBook(book.id);
      setNotice({ type: "success", text: "Xoá sách thành công." });
      loadData();
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  return (
    <div className="admin-page__content">
      {notice && (
        <div className={`books-page__notice books-page__notice--${notice.type}`} role="status">
          {notice.text}
        </div>
      )}

      {/* Form thêm / sửa sách */}
      <Reveal direction="up">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3 className="admin-form__title">{editingId ? "Sửa sách" : "Thêm sách mới"}</h3>

          <div className="admin-form__grid">
            <div className="contact__field">
              <label htmlFor="admin-title">Tên sách</label>
              <input
                id="admin-title"
                name="title"
                type="text"
                required
                minLength={2}
                maxLength={200}
                placeholder="vd: Lập trình Python"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="contact__field">
              <label htmlFor="admin-author">Tác giả</label>
              <input
                id="admin-author"
                name="author"
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="vd: Nguyễn Văn An"
                value={form.author}
                onChange={handleChange}
              />
            </div>

            <div className="contact__field">
              <label htmlFor="admin-year">Năm xuất bản</label>
              <input
                id="admin-year"
                name="year"
                type="number"
                required
                min={1900}
                max={new Date().getFullYear()}
                placeholder="2024"
                value={form.year}
                onChange={handleChange}
              />
            </div>

            <div className="contact__field">
              <label htmlFor="admin-quantity">Số lượng</label>
              <input
                id="admin-quantity"
                name="quantity"
                type="number"
                required
                min={1}
                max={100}
                placeholder="5"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="contact__field">
              <label htmlFor="admin-category">Thể loại</label>
              <select
                id="admin-category"
                name="category_id"
                required
                value={form.category_id}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Chọn thể loại...
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form__actions">
              {editingId && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setEditingId(null);
                    setForm(EMPTY_BOOK_FORM);
                  }}
                >
                  Huỷ sửa
                </button>
              )}
              <button type="submit" className="btn btn--primary">
                {editingId ? "Lưu thay đổi" : "Thêm sách"}
              </button>
            </div>
          </div>
        </form>
      </Reveal>

      {/* Bảng danh sách sách */}
      <Reveal direction="up" delay={0.1}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Năm</th>
                <th>Thể loại</th>
                <th>Tổng / Còn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-table__empty">
                    Chưa có sách nào.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td className="admin-table__title">{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.year}</td>
                    <td>{book.category?.name ?? "—"}</td>
                    <td>
                      {book.available} / {book.quantity}
                    </td>
                    <td className="admin-table__actions">
                      <button type="button" onClick={() => startEdit(book)}>
                        Sửa
                      </button>
                      <button type="button" className="admin-table__delete" onClick={() => handleDelete(book)}>
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}

/* ==================== Quản lý thể loại ==================== */

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_CATEGORY_FORM);
  const [notice, setNotice] = useState(null);

  const loadData = useCallback(async () => {
    setCategories(await api.getCategories());
  }, []);

  useEffect(() => {
    loadData().catch((err) => setNotice({ type: "error", text: err.message }));
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);
    try {
      await api.createCategory({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setNotice({ type: "success", text: "Tạo thể loại thành công." });
      setForm(EMPTY_CATEGORY_FORM);
      loadData();
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  return (
    <div className="admin-page__content">
      {notice && (
        <div className={`books-page__notice books-page__notice--${notice.type}`} role="status">
          {notice.text}
        </div>
      )}

      <Reveal direction="up">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3 className="admin-form__title">Thêm thể loại mới</h3>
          <div className="admin-form__grid">
            <div className="contact__field">
              <label htmlFor="admin-cat-name">Tên thể loại</label>
              <input
                id="admin-cat-name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="vd: Khoa học"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="contact__field">
              <label htmlFor="admin-cat-desc">Mô tả (tuỳ chọn)</label>
              <input
                id="admin-cat-desc"
                name="description"
                type="text"
                maxLength={255}
                placeholder="vd: Sách khoa học - công nghệ"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form__actions">
              <button type="submit" className="btn btn--primary">
                Thêm thể loại
              </button>
            </div>
          </div>
        </form>
      </Reveal>

      <Reveal direction="up" delay={0.1}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên thể loại</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="admin-table__empty">
                    Chưa có thể loại nào.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td className="admin-table__title">{category.name}</td>
                    <td>{category.description || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
