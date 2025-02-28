import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription,
  DialogClose 
} from '../dialog';

// Helper component to simplify testing
const TestDialog = ({
  open = false, 
  onOpenChange,
  showCloseButton = true,
  animationVariant = "default",
  centered = false,
  stackButtons = true,
  content = "Dialog Content"
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger>Open Dialog</DialogTrigger>
    <DialogContent showCloseButton={showCloseButton} animationVariant={animationVariant}>
      <DialogHeader centered={centered}>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>Dialog Description</DialogDescription>
      </DialogHeader>
      {content}
      <DialogFooter stackButtons={stackButtons}>
        <DialogClose asChild>
          <button>Cancel</button>
        </DialogClose>
        <button>Save</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

describe('Dialog Component', () => {
  it('renders trigger but not content when closed', () => {
    render(<TestDialog />);
    
    // Trigger should be visible
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    
    // Content should not be in document when closed
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Dialog Content')).not.toBeInTheDocument();
  });

  it('shows dialog content when trigger is clicked', async () => {
    render(<TestDialog />);
    
    // Click trigger to open dialog
    fireEvent.click(screen.getByText('Open Dialog'));
    
    // Dialog content should be visible
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      expect(screen.getByText('Dialog Description')).toBeInTheDocument();
    });
  });

  it('calls onOpenChange callback when dialog state changes', async () => {
    const handleOpenChange = vi.fn();
    
    render(<TestDialog onOpenChange={handleOpenChange} />);
    
    // Open dialog
    fireEvent.click(screen.getByText('Open Dialog'));
    expect(handleOpenChange).toHaveBeenCalledWith(true);
    
    // Wait for content to appear
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
    
    // Close dialog with X button
    fireEvent.click(screen.getByTestId('dialog-x-close'));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes dialog when clicking the close button in footer', async () => {
    const handleOpenChange = vi.fn();
    
    render(<TestDialog onOpenChange={handleOpenChange} />);
    
    // Open dialog
    fireEvent.click(screen.getByText('Open Dialog'));
    
    // Wait for content to appear
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
    
    // Close dialog with Cancel button
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('hides close X button when showCloseButton is false', async () => {
    render(<TestDialog showCloseButton={false} />);
    
    // Open dialog
    fireEvent.click(screen.getByText('Open Dialog'));
    
    // Wait for content to appear
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
    
    // X close button should not be visible
    expect(screen.queryByTestId('dialog-x-close')).not.toBeInTheDocument();
  });

  it('applies correct animation classes based on variant', async () => {
    const { rerender } = render(<TestDialog open={true} animationVariant="centered" />);
    
    // Check centered variant
    let content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('data-[state=open]:animate-in');
    expect(content).toHaveClass('data-[state=open]:fade-in-0');
    expect(content).toHaveClass('data-[state=open]:zoom-in-95');
    expect(content).not.toHaveClass('data-[state=open]:slide-in-from-left-1/2');
    
    // Check slide-up variant
    rerender(<TestDialog open={true} animationVariant="slide-up" />);
    content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('data-[state=open]:slide-in-from-bottom-[48%]');
    
    // Check none variant
    rerender(<TestDialog open={true} animationVariant="none" />);
    content = screen.getByTestId('dialog-content');
    expect(content).not.toHaveClass('data-[state=open]:animate-in');
  });

  it('centers header content when centered prop is true', async () => {
    render(<TestDialog open={true} centered={true} />);
    
    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('text-center');
    expect(header).not.toHaveClass('text-left');
  });

  it('aligns header content to left by default', async () => {
    render(<TestDialog open={true} />);
    
    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('text-left');
    expect(header).not.toHaveClass('text-center');
  });

  it('stacks buttons vertically on mobile by default', async () => {
    render(<TestDialog open={true} />);
    
    const footer = screen.getByTestId('dialog-footer');
    expect(footer).toHaveClass('flex-col-reverse');
    expect(footer).toHaveClass('sm:flex-row');
  });

  it('allows horizontal button layout when stackButtons is false', async () => {
    render(<TestDialog open={true} stackButtons={false} />);
    
    const footer = screen.getByTestId('dialog-footer');
    expect(footer).toHaveClass('flex-row');
    expect(footer).not.toHaveClass('flex-col-reverse');
  });

  it('has proper ARIA attributes for accessibility', async () => {
    render(<TestDialog open={true} />);
    
    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveAttribute('role', 'dialog');
    expect(content).toHaveAttribute('aria-modal', 'true');
    expect(content).toHaveAttribute('aria-labelledby', 'dialog-title');
    expect(content).toHaveAttribute('aria-describedby', 'dialog-description');
    
    // Title and description should have corresponding IDs
    const title = screen.getByTestId('dialog-title');
    const description = screen.getByTestId('dialog-description');
    expect(title).toHaveAttribute('id', 'dialog-title');
    expect(description).toHaveAttribute('id', 'dialog-description');
  });

  it('renders children in various parts of the dialog', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Title</DialogTitle>
            <DialogDescription>Custom Description</DialogDescription>
          </DialogHeader>
          <div data-testid="custom-content">Custom Content</div>
          <DialogFooter>
            <button data-testid="custom-button">Custom Button</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
  });
}); 