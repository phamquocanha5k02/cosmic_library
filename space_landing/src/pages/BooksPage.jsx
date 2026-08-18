import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Reveal from "../components/Reveal";

/**
 * BooksPage — KHO SÁCH, dữ liệu thật từ GET /api/books.
 * - Ô tìm kiếm (debounce 400ms) → ?search=
 * - Chips lọc thể loại → ?category_id=
 * - Mỗi thẻ sách có nút "Mượn" (cần đăng nhập) → POST /api/borrows
 */
export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [borrowingId, setBorrowingId] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getBooks({ search, categoryId });
      setBooks(data);
    } catch (err) {
      setError(err.message || "Không tải được danh sách sách");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId]);

  // Debounce ô tìm kiếm: chờ người dùng gõ xong 400ms mới gọi API
  useEffect(() => {
    const timer = setTimeout(loadBooks, 400);
    return () => clearTimeout(timer);
  }, [loadBooks]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleBorrow = async (bookId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    setBorrowingId(bookId);
    setNotice(null);
    try {
      await api.borrowBook(bookId);
      setNotice({ type: "success", text: "Mượn sách thành công! Xem trong 'Mượn của tôi'." });
      loadBooks(); // cập nhật lại số lượng còn trên kệ
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setBorrowingId(null);
    }
  };

  return (
    <section className="books-page">
      <div className="container">
        <Reveal direction="up">
          <div className="books-page__header">
            <span className="section-label">Kho sách vũ trụ</span>
            <h1 className="books-page__title">
              Tìm kiếm <span className="text-gradient">tri thức</span> của bạn
            </h1>
            <p className="books-page__description">
              Duyệt kho sách trực tiếp từ thư viện. Đăng nhập để mượn bất kỳ cuốn nào còn khả dụng.
            </p>
          </div>
        </Reveal>

        {/* Thanh tìm kiếm + lọc thể loại */}
        <Reveal direction="up" delay={0.1}>
          <div className="books-page__toolbar">
            <div className="books-page__search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Tìm theo tên sách hoặc tác giả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Tìm kiếm sách"
              />
            </div>

            <div className="books-page__filters" role="tablist" aria-label="Lọc theo thể loại">
              <button
                type="button"
                role="tab"
                aria-selected={categoryId === ""}
                className={`books-page__chip ${categoryId === "" ? "books-page__chip--active" : ""}`}
                onClick={() => setCategoryId("")}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={categoryId === String(category.id)}
                  className={`books-page__chip ${categoryId === String(category.id) ? "books-page__chip--active" : ""}`}
                  onClick={() => setCategoryId(String(category.id))}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Thông báo mượn sách */}
        {notice && (
          <div className={`books-page__notice books-page__notice--${notice.type}`} role="status">
            {notice.text}
          </div>
        )}

        {/* Danh sách sách */}
        {loading ? (
          <p className="books-page__empty">Đang quét vũ trụ sách...</p>
        ) : error ? (
          <p className="books-page__empty books-page__empty--error">{error}</p>
        ) : books.length === 0 ? (
          <p className="books-page__empty">Không tìm thấy cuốn sách nào phù hợp.</p>
        ) : (
          <div className="books-page__grid">
            {books.map((book, index) => (
              <Reveal key={book.id} direction="up" delay={(index % 3) * 0.08}>
                <article className="book-card">
                  <div className="book-card__cover" aria-hidden="true">
                    <span className="book-card__cover-initials">{book.title.slice(0, 1)}</span>
                    <span className="book-card__cover-stars">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <i key={i} />
                      ))}
                    </span>
                  </div>

                  <div className="book-card__body">
                    <span className="book-card__category">
                      {book.category?.name ?? "Chưa phân loại"}
                    </span>
                    <h3 className="book-card__title">{book.title}</h3>
                    <p className="book-card__author">
                      {book.author} · {book.year}
                    </p>

                    <div className="book-card__meta">
                      <span
                        className={`book-card__status ${
                          book.available > 0 ? "book-card__status--ok" : "book-card__status--out"
                        }`}
                      >
                        {book.available > 0 ? `Còn ${book.available} cuốn` : "Hết sách"}
                      </span>
                      <span className="book-card__total">Tổng: {book.quantity}</span>
                    </div>

                    {token ? (
                      <button
                        type="button"
                        className="btn btn--primary book-card__button"
                        disabled={book.available <= 0 || borrowingId === book.id}
                        onClick={() => handleBorrow(book.id)}
                      >
                        {borrowingId === book.id ? "Đang mượn..." : "Mượn sách"}
                      </button>
                    ) : (
                      <Link to="/login" className="btn btn--ghost book-card__button">
                        Đăng nhập để mượn
                      </Link>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
