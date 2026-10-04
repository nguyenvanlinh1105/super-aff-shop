"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type CartDealItem = {
  id: string;
  title: string;
  description?: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  platformCode: string;
  category?: string | null;
  imageUrl?: string | null;
  shortUrl?: string | null;
  linkType?: string;
  estimatedCashback: number;
  addedAt: number;
};

interface DealCartContextType {
  cartItems: CartDealItem[];
  addToCart: (deal: {
    id: string;
    title: string;
    description?: string | null;
    salePrice: number | null;
    originalPrice: number | null;
    discountPercent: number | null;
    platformCode?: string;
    category?: string | null;
    imageUrl?: string | null;
    shortUrl?: string | null;
    linkType?: string;
  }) => boolean; // returns true if added, false if already in cart
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  totalAmount: number;
  totalEstimatedCashback: number;
  totalCount: number;
  toastMessage: string | null;
}

const DealCartContext = createContext<DealCartContextType | undefined>(undefined);

const STORAGE_KEY = "meowback_deal_cart_v2";

// Ước tính mức hoàn tiền dựa trên mức giá và ngành hàng (trung bình ~8% giá trị đơn * 80% tỷ lệ chia cho khách)
export function calculateEstimatedCashback(price: number | null, discountPercent: number | null): number {
  if (!price || price <= 0) return 15000; // Giá trị ước tính tượng trưng nếu không có giá cụ thể
  // Ước tính hoa hồng sàn ~8%, khách nhận 80% => ~6.4% giá trị sản phẩm
  const rate = 0.064;
  const rawEst = Math.round(price * rate);
  // Làm tròn đến hàng nghìn gần nhất
  return Math.max(5000, Math.round(rawEst / 1000) * 1000);
}

export function DealCartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartDealItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems, isHydrated]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }

  function addToCart(deal: {
    id: string;
    title: string;
    description?: string | null;
    salePrice: number | null;
    originalPrice: number | null;
    discountPercent: number | null;
    platformCode?: string;
    category?: string | null;
    imageUrl?: string | null;
    shortUrl?: string | null;
    linkType?: string;
  }): boolean {
    const exists = cartItems.some((item) => item.id === deal.id);
    if (exists) {
      showToast("Sản phẩm đã có trong Túi Săn Deal 🎀");
      return false;
    }

    const estCashback = calculateEstimatedCashback(deal.salePrice, deal.discountPercent);

    const newItem: CartDealItem = {
      id: deal.id,
      title: deal.title,
      description: deal.description,
      salePrice: deal.salePrice,
      originalPrice: deal.originalPrice,
      discountPercent: deal.discountPercent,
      platformCode: deal.platformCode || "SHOPEE",
      category: deal.category,
      imageUrl: deal.imageUrl,
      shortUrl: deal.shortUrl,
      linkType: deal.linkType,
      estimatedCashback: estCashback,
      addedAt: Date.now(),
    };

    setCartItems((prev) => [newItem, ...prev]);
    showToast(`Đã thêm vào Túi Deal! Nhận ước tính +${new Intl.NumberFormat("vi-VN").format(estCashback)}đ hoàn tiền 🐾`);
    return true;
  }

  function removeFromCart(id: string) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast("Đã bỏ sản phẩm khỏi túi");
  }

  function clearCart() {
    setCartItems([]);
    showToast("Đã dọn sạch Túi Săn Deal");
  }

  function isInCart(id: string) {
    return cartItems.some((item) => item.id === id);
  }

  function toggleCart() {
    setIsCartOpen((prev) => !prev);
  }

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.salePrice || item.originalPrice || 0), 0);
  }, [cartItems]);

  const totalEstimatedCashback = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.estimatedCashback, 0);
  }, [cartItems]);

  const totalCount = cartItems.length;

  return (
    <DealCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
        totalAmount,
        totalEstimatedCashback,
        totalCount,
        toastMessage,
      }}
    >
      {children}
    </DealCartContext.Provider>
  );
}

export function useDealCart() {
  const context = useContext(DealCartContext);
  if (!context) {
    throw new Error("useDealCart must be used within a DealCartProvider");
  }
  return context;
}
