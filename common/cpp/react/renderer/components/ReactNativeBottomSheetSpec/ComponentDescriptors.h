#pragma once

#include "ShadowNodes.h"
#include <algorithm>
#include <react/renderer/components/view/YogaLayoutableShadowNode.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {

class BottomSheetViewComponentDescriptor final
    : public ConcreteComponentDescriptor<BottomSheetViewShadowNode> {
 public:
  using ConcreteComponentDescriptor::ConcreteComponentDescriptor;

  State::Shared createInitialState(
      const Props::Shared& /*props*/,
      const ShadowNodeFamily::Shared& family) const override {
    return std::make_shared<BottomSheetViewShadowNode::ConcreteState>(
        std::make_shared<const BottomSheetViewState>(),
        family);
  }

  // Runs on every create/clone, so the node's root-ness tracks the current
  // `nativeOverlay` prop. A native-overlay sheet presents its content in a
  // window-level full-screen overlay, so — like <Modal> — it must act as a layout
  // root for descendant measure/touch coordinates to resolve correctly.
  void adopt(ShadowNode& shadowNode) const override {
    auto& node = static_cast<BottomSheetViewShadowNode&>(shadowNode);
    const auto& props =
        static_cast<const BottomSheetViewProps&>(*node.getProps());
    node.setIsOverlayRoot(props.nativeOverlay);

    const auto& stateData =
        static_cast<const BottomSheetViewShadowNode::ConcreteState&>(
            *shadowNode.getState())
            .getData();
    auto& layoutableShadowNode =
        static_cast<YogaLayoutableShadowNode&>(shadowNode);

    // The content-region inset, applied as Yoga BOTTOM padding in every mode.
    // In-flow content (the flex: 1 wrapper) then resolves to the content region
    // (see contentRegionPadding); absolutely positioned children (the surface)
    // ignore padding and keep filling the node. Bottom rather than top keeps
    // the content's Yoga origin at zero, matching its native placement at the
    // top of the (already offset) sheet container on both platforms — the
    // container's top offset is carried by the contentOffsetY state instead.
    layoutableShadowNode.setPadding(
        {0, 0, 0, contentRegionPadding(props, stateData)});

    // In native-overlay mode the sheet's real container is the full-screen
    // overlay window, not the in-tree slot. Both platforms report the sheet's
    // measured size through the state; force the node's size from it — exactly
    // as <Modal> does — so Yoga lays the subtree out against the overlay's
    // true edge-to-edge bounds rather than JS-estimated window dimensions,
    // which under edge-to-edge exclude the system bars. The size stays zero
    // until the first native report, leaving the JS-provided first-frame
    // estimate in effect; inline sheets are Fabric-owned (this branch is
    // gated on the prop).
    if (props.nativeOverlay &&
        stateData.frameSize.width != 0 && stateData.frameSize.height != 0) {
      layoutableShadowNode.setSize(stateData.frameSize);
      layoutableShadowNode.setPositionType(YGPositionTypeAbsolute);
    }

    ConcreteComponentDescriptor::adopt(shadowNode);
  }

 private:
  // Sizes the content region to the tallest height the sheet can reach. The
  // native state reports the gap between the sheet's height and the detent cap.
  // Without a `content` detent, the tallest detent can sit below the cap, and
  // content laid out against the full cap would extend below the screen, where
  // a filling scrollable's last items can never scroll into view. A `content`
  // detent keeps the cap, since the content is measured against it. Depends only
  // on props and native geometry, never on the sheet's position, so it stays
  // constant while the sheet moves.
  static Float contentRegionPadding(
      const BottomSheetViewProps& props,
      const BottomSheetViewState& state) {
    const Float hostHeight = state.frameSize.height;
    const Float capInset = state.contentRegionInset;
    if (hostHeight <= 0) {
      return capInset;
    }
    const Float cap = hostHeight - capInset;
    Float tallest = 0;
    for (const auto& detent : props.detents) {
      if (detent.kind == "content") {
        return capInset;
      }
      const auto value = static_cast<Float>(detent.value);
      tallest =
          std::max(tallest, detent.kind == "percentage" ? cap * value : value);
    }
    if (tallest <= 0) {
      return capInset;
    }
    return hostHeight - std::min(tallest, cap);
  }
};

// The surface needs no custom initial state, so this mirrors the codegen alias.
using BottomSheetSurfaceViewComponentDescriptor =
    ConcreteComponentDescriptor<BottomSheetSurfaceViewShadowNode>;

} // namespace facebook::react
