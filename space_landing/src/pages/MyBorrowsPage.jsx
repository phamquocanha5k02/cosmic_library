import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate, formatDateTime } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Reveal from "../components/Reveal";

/**
 * MyBorrowsPage — lịch sử mượn/trả của tôi (GET /api/borrows/my).
 * Phiếu đang mượn có nút "Trả sách" → POST /api/borrows/{id}/return.
 */
export default function MyBorrowsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returningId, setReturningId] = useState(null);
  const { token, user } = useAuth();

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getMyBorrows();
      setRecords(data);
    } catch (err) {
      setError(err.message || "Không tải được lịch sử mượn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) loadRecords();
  }, [token, loadRecords]);

  const handleReturn = async (recordId) => {
    setReturningId(recordId);
    try {
      await api.returnBook(recordId);
      loadRecords();
    } catch (err) {
      setError(err.message || "Trả sách thất bại");
    } finally {
      setReturningId(null);
    }
  };

  // Chưa đăng nhập → nhắc nhập tài khoản
  if (!token) {
    return (
      <section className="borrows-page">
        <div className="container">
          <div className="borrows-page__empty-state">
            <span className="section-label">Mượn của tôi</span>
            <h1 className="borrows-page__title">Bạn cần đăng nhập</h1>
            <p className="borrows-page__description">
              Đăng nhập để xem phiếu mượn và lịch sử mượn/trả của bạn.
            </p>
            <Link to="/login" className="btn btn--primary">
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const activeRecords = records.filter((r) => r.status === "borrowing");
  const historyRecords = records.filter((r) => r.status === "returned");

  return (
    <section className="borrows-page">
      <div className="container">
        <Reveal direction="up">
          <div className="borrows-page__header">
            <span className="section-label">Thẻ thư viện của {user?.full_name}</span>
            <h1 className="borrows-page__title">
              Phiếu mượn <span className="text-gradient">của tôi</span>
            </h1>
            <p className="borrows-page__description">
              Mỗi người được mượn tối đa 3 cuốn cùng lúc, hạn trả 14 ngày kể từ ngày mượn.
            </p>
          </div>
        </Reveal>

        {error && (
          <div className="books-page__notice books-page__notice--error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p className="books-page__empty">Đang nạp phiếu mượn...</p>
        ) : (
          <>
            {/* Phiếu đang mượn */}
            <Reveal direction="up">
              <h2 className="borrows-page__subtitle">Đang mượn ({activeRecords.length})</h2>
            </Reveal>
            {activeRecords.length === 0 ? (
              <Reveal direction="up">
                <div className="borrows-page__empty-state borrows-page__empty-state--small">
                  <p>Bạn chưa mượn cuốn nào. Ghé{" "}
                    <Link to="/books" className="auth-card__link">kho sách</Link> nhé!</p>
                </div>
              </Reveal>
            ) : (
              <div className="borrows-page__grid">
                {activeRecords.map((record, index) => (
                  <Reveal key={record.id} direction="up" delay={(index % 3) * 0.08}>
                    <article className="borrow-card borrow-card--active">
                      <span className="borrow-card__status">Đang mượn</span>
                      <h3 className="borrow-card__title">{record.book?.title}</h3>
                      <p className="borrow-card__author">
                        {record.book?.author} · {record.book?.year}
                      </p>
                      <div className="borrow-card__dates">
                        <div>
                          <small>Ngày mượn</small>
                          <span>{formatDate(record.borrow_date)}</span>
                        </div>
                        <div>
                          <small>Hạn trả</small>
                          <span className={isOverdue(record.due_date) ? "borrow-card__dates--overdue" : ""}>
                            {formatDate(record.due_date)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn--ghost borrow-card__button"
                        disabled={returningId === record.id}
                        onClick={() => handleReturn(record.id)}
                      >
                        {returningId === record.id ? "Đang trả..." : "Trả sách"}
                      </button>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}

            {/* Lịch sử đã trả */}
            <Reveal direction="up">
              <h2 className="borrows-page__subtitle">Đã trả ({historyRecords.length})</h2>
            </Reveal>
            {historyRecords.length === 0 ? (
              <Reveal direction="up">
                <div className="borrows-page__empty-state borrows-page__empty-state--small">
                  <p>Chưa có lịch sử trả sách.</p>
                </div>
              </Reveal>
            ) : (
              <div className="borrows-page__list">
                {historyRecords.map((record, index) => (
                  <Reveal key={record.id} direction="up" delay={(index % 5) * 0.05}>
                    <article className="borrow-row">
                      <div className="borrow-row__info">
                        <h3 className="borrow-row__title">{record.book?.title}</h3>
                        <p className="borrow-row__author">{record.book?.author}</p>
                      </div>
                      <div className="borrow-row__dates">
                        <span>
                          Mượn: <strong>{formatDateTime(record.borrow_date)}</strong>
                        </span>
                        <span>
                          Trả: <strong>{formatDateTime(record.return_date)}</strong>
                        </span>
                      </div>
                      <span className="borrow-row__badge">Đã trả</span>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/** Kiểm tra hạn trả đã qua chưa. */
function isOverdue(dueDateIso) {
  if (!dueDateIso) return false;
  return new Date(dueDateIso) < new Date();
}
