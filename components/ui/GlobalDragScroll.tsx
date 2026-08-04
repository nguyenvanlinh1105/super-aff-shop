"use client";

import { useEffect } from "react";

/**
 * GlobalDragScroll Component
 * Enables mouse click-and-drag horizontal scrolling for all scrollable tables and containers
 */
export function GlobalDragScroll() {
  useEffect(() => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let activeContainer: HTMLElement | null = null;
    let hasMoved = false;

    function handleMouseDown(e: MouseEvent) {
      if (e.button !== 0) return; // Only primary left mouse click

      const target = e.target as HTMLElement;
      if (!target) return;

      // Ignore interactive controls like buttons, inputs, links
      if (target.closest("button, input, select, a, textarea, [role='button'], [data-no-drag]")) return;

      // Find scroll container
      let container: HTMLElement | null = target.closest(".overflow-x-auto, .responsive-table, [data-drag-scroll]");
      if (!container) return;

      // Check if it actually has horizontal overflow
      if (container.scrollWidth <= container.clientWidth) return;

      isDown = true;
      hasMoved = false;
      activeContainer = container;
      startX = e.pageX - container.getBoundingClientRect().left;
      scrollLeft = container.scrollLeft;
    }

    function handleMouseMove(e: MouseEvent) {
      if (!isDown || !activeContainer) return;

      const x = e.pageX - activeContainer.getBoundingClientRect().left;
      const walk = (x - startX) * 1.5; // Drag speed multiplier

      if (Math.abs(walk) > 3) {
        hasMoved = true;
        activeContainer.style.cursor = "grabbing";
        activeContainer.style.userSelect = "none";
        activeContainer.scrollLeft = scrollLeft - walk;
      }
    }

    function handleMouseUp() {
      if (activeContainer) {
        activeContainer.style.cursor = "";
        activeContainer.style.userSelect = "";
      }
      isDown = false;
      activeContainer = null;
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return null;
}
