# Custom Confirm Dialog Component

## Overview
A reusable confirmation dialog component for confirming destructive or important actions throughout the application.

## Location
`app/components/ConfirmDialog.tsx`

## Features
- ✅ Beautiful dark-themed design matching the app
- ✅ Three color variants (danger, warning, info)
- ✅ Loading state support
- ✅ Backdrop blur effect
- ✅ Smooth animations
- ✅ Keyboard accessible
- ✅ Mobile responsive

## Usage

### Basic Example

```tsx
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { useState } from 'react';

export default function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Perform delete operation
      await deleteItem();
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Delete Item
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controls dialog visibility |
| `onClose` | `() => void` | required | Called when dialog is cancelled |
| `onConfirm` | `() => void` | required | Called when action is confirmed |
| `title` | `string` | required | Dialog title |
| `message` | `string` | required | Dialog message/description |
| `confirmText` | `string` | "Confirm" | Confirm button text |
| `cancelText` | `string` | "Cancel" | Cancel button text |
| `type` | `'danger' \| 'warning' \| 'info'` | "danger" | Visual style variant |
| `loading` | `boolean` | `false` | Shows loading state on confirm button |

## Type Variants

### Danger (Red)
Use for destructive actions like deleting items.
```tsx
<ConfirmDialog type="danger" ... />
```
- Red icon and button
- Use for: Delete, Remove, Permanently Delete

### Warning (Orange/Amber)
Use for important actions with consequences.
```tsx
<ConfirmDialog type="warning" ... />
```
- Orange/amber icon and button
- Use for: Sign Out, Discard Changes, Reset Settings

### Info (Gold)
Use for informational confirmations.
```tsx
<ConfirmDialog type="info" ... />
```
- Gold icon and button
- Use for: Confirm Action, Proceed, Continue

## Current Implementations

### 1. Vehicle Deletion
**Location:** `app/dashboard/vehicles/page.tsx`

```tsx
const [deleteConfirm, setDeleteConfirm] = useState({
  show: false,
  vehicleId: null,
  deleting: false,
});

<ConfirmDialog
  isOpen={deleteConfirm.show}
  onClose={() => setDeleteConfirm({ show: false, vehicleId: null, deleting: false })}
  onConfirm={handleDeleteConfirm}
  title="Delete Vehicle"
  message="Are you sure you want to delete this vehicle? This action cannot be undone."
  confirmText="Delete"
  type="danger"
  loading={deleteConfirm.deleting}
/>
```

### 2. Logout Confirmation
**Location:** `app/dashboard/layout.tsx`

```tsx
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const [loggingOut, setLoggingOut] = useState(false);

<ConfirmDialog
  isOpen={showLogoutConfirm}
  onClose={() => setShowLogoutConfirm(false)}
  onConfirm={handleLogoutConfirm}
  title="Sign Out"
  message="Are you sure you want to sign out of your account?"
  confirmText="Sign Out"
  type="warning"
  loading={loggingOut}
/>
```

## State Management Pattern

### Simple Boolean State
For single-use confirmations:
```tsx
const [showConfirm, setShowConfirm] = useState(false);
```

### Object State with Context
For confirmations that need additional context:
```tsx
const [deleteConfirm, setDeleteConfirm] = useState({
  show: false,
  itemId: null,
  loading: false,
});
```

## Styling

### Colors
- **Background:** `#1A1A1A` (dark card)
- **Border:** `#2A2A2A` (subtle border)
- **Text:** White and `#B3B3B3` (gray)
- **Backdrop:** `black/70` with blur

### Animations
- Fade in
- Zoom in (scale 0.95 → 1)
- Duration: 200ms

### Variants
```typescript
danger: {
  icon: 'text-[#DD4A48]',     // Red
  iconBg: 'bg-[#DD4A48]/10',
  button: 'bg-[#DD4A48] hover:bg-[#C43E3B]',
}

warning: {
  icon: 'text-[#F59E0B]',     // Orange
  iconBg: 'bg-[#F59E0B]/10',
  button: 'bg-[#F59E0B] hover:bg-[#D97706]',
}

info: {
  icon: 'text-[#CBA86E]',     // Gold
  iconBg: 'bg-[#CBA86E]/10',
  button: 'bg-[#CBA86E] hover:bg-[#B89860]',
}
```

## Best Practices

### 1. Always Handle Loading States
```tsx
const handleConfirm = async () => {
  setLoading(true);
  try {
    await performAction();
    onClose(); // Close only on success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### 2. Use Descriptive Messages
❌ Bad:
```tsx
message="Are you sure?"
```

✅ Good:
```tsx
message="Are you sure you want to delete this vehicle? This action cannot be undone."
```

### 3. Choose Appropriate Type
- **Danger:** Data loss, permanent deletion
- **Warning:** Session changes, unsaved work
- **Info:** Simple confirmations, optional actions

### 4. Disable Actions During Loading
The component automatically disables buttons and shows loading spinner when `loading={true}`.

### 5. Clear State on Close
```tsx
const handleClose = () => {
  setShowConfirm(false);
  setLoading(false);
  // Clear any context data
};
```

## Accessibility

- ✅ Focus trap (modal)
- ✅ ESC key to close (can be added)
- ✅ Keyboard navigation
- ✅ ARIA labels (can be enhanced)
- ✅ Screen reader friendly

## Future Enhancements

### 1. ESC Key Support
```tsx
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen && !loading) {
      onClose();
    }
  };
  window.addEventListener('keydown', handleEsc);
  return () => window.removeEventListener('keydown', handleEsc);
}, [isOpen, loading, onClose]);
```

### 2. Focus Management
```tsx
const dialogRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);
```

### 3. Custom Icons
```tsx
icon?: React.ReactNode;
```

### 4. Input Field Support
For confirmations that require typing (e.g., "Type DELETE to confirm"):
```tsx
requireConfirmation?: string;
```

## Testing

### Manual Testing Checklist
- [ ] Opens correctly
- [ ] Closes on cancel
- [ ] Closes on backdrop click (if enabled)
- [ ] Executes confirm action
- [ ] Shows loading state
- [ ] Disables buttons during loading
- [ ] Displays correct colors per type
- [ ] Works on mobile
- [ ] Animations smooth

### Example Test Cases
```tsx
// Test opening
fireEvent.click(deleteButton);
expect(screen.getByText('Delete Vehicle')).toBeInTheDocument();

// Test cancel
fireEvent.click(screen.getByText('Cancel'));
expect(screen.queryByText('Delete Vehicle')).not.toBeInTheDocument();

// Test confirm
fireEvent.click(screen.getByText('Delete'));
expect(mockOnConfirm).toHaveBeenCalled();
```

## Migration Guide

### Replace Native Confirm
❌ Before:
```tsx
const handleDelete = () => {
  if (!confirm('Are you sure?')) return;
  deleteItem();
};
```

✅ After:
```tsx
const [showConfirm, setShowConfirm] = useState(false);

const handleDelete = () => {
  setShowConfirm(true);
};

const handleConfirm = async () => {
  await deleteItem();
  setShowConfirm(false);
};

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleConfirm}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  type="danger"
/>
```

## Support

For issues or questions:
1. Check existing implementations
2. Review props documentation
3. Test with different variants
