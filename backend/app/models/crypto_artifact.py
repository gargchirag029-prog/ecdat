from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class CryptoArtifact(Base):
    __tablename__ = "crypto_artifacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scan_id: Mapped[str] = mapped_column(ForeignKey("scans.id"), index=True)
    algorithm: Mapped[str] = mapped_column(String(64))
    variant: Mapped[str | None] = mapped_column(String(128), nullable=True)
    key_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file: Mapped[str] = mapped_column(String(1024))
    line: Mapped[int] = mapped_column(Integer)
    library: Mapped[str | None] = mapped_column(String(128), nullable=True)
    api: Mapped[str | None] = mapped_column(String(256), nullable=True)
    purpose: Mapped[str] = mapped_column(String(64), default="Unknown")
    confidence: Mapped[str] = mapped_column(String(16))
    risk: Mapped[str] = mapped_column(String(16))
    risk_score: Mapped[int] = mapped_column(Integer, default=0)
    risk_reason: Mapped[str] = mapped_column(Text)
    quantum_status: Mapped[str] = mapped_column(String(32))
    pqc_migration: Mapped[bool] = mapped_column(default=False)
    migration_priority: Mapped[str] = mapped_column(String(16))
    recommendation: Mapped[str] = mapped_column(Text)
    snippet: Mapped[str] = mapped_column(Text)

    scan = relationship("Scan", back_populates="artifacts")
