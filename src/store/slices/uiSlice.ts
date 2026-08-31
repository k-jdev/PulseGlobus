import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/store";
import type { Category, SidePanel, Theme, TimeFilter, ViewMode } from "@/types";

const MOBILE_BREAKPOINT = 768;

const isMobileViewport = () =>
  typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

export interface UiState {
  theme: Theme;
  viewMode: ViewMode;
  timeFilter: TimeFilter;
  activeCategory: Category;
  isMobileMenuOpen: boolean;
  /** Globe auto-rotation is paused by default on mobile to save battery. */
  isGlobeSpinPaused: boolean;
  openPanel: SidePanel;
}

const initialState: UiState = {
  theme: "light",
  viewMode: "globe",
  timeFilter: "24h",
  activeCategory: "All Markets",
  isMobileMenuOpen: false,
  isGlobeSpinPaused: isMobileViewport(),
  openPanel: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    themeChanged(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    viewModeChanged(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
    },
    timeFilterChanged(state, action: PayloadAction<TimeFilter>) {
      state.timeFilter = action.payload;
    },
    categoryChanged(state, action: PayloadAction<Category>) {
      state.activeCategory = action.payload;
    },
    globeSpinPausedChanged(state, action: PayloadAction<boolean>) {
      state.isGlobeSpinPaused = action.payload;
    },
    mobileMenuToggled(state, action: PayloadAction<boolean>) {
      state.isMobileMenuOpen = action.payload;
      if (action.payload) {
        state.openPanel = null;
      }
    },
    panelToggled(state, action: PayloadAction<NonNullable<SidePanel>>) {
      state.openPanel =
        state.openPanel === action.payload ? null : action.payload;
    },
    panelsClosed(state) {
      state.openPanel = null;
    },
  },
});

export const {
  themeChanged,
  viewModeChanged,
  timeFilterChanged,
  categoryChanged,
  globeSpinPausedChanged,
  mobileMenuToggled,
  panelToggled,
  panelsClosed,
} = uiSlice.actions;

export const selectTheme = (state: RootState) => state.ui.theme;
export const selectViewMode = (state: RootState) => state.ui.viewMode;
export const selectTimeFilter = (state: RootState) => state.ui.timeFilter;
export const selectActiveCategory = (state: RootState) =>
  state.ui.activeCategory;
export const selectIsMobileMenuOpen = (state: RootState) =>
  state.ui.isMobileMenuOpen;
export const selectIsGlobeSpinPaused = (state: RootState) =>
  state.ui.isGlobeSpinPaused;
export const selectOpenPanel = (state: RootState) => state.ui.openPanel;

/** The bubble view has no dark styling, so it always renders in light theme. */
export const selectEffectiveTheme = (state: RootState): Theme =>
  state.ui.viewMode === "bubble" ? "light" : state.ui.theme;

export default uiSlice.reducer;
