import React from 'react';

const StatusBadge = React.memo(({ quantity, reorderThreshold = 50, expiryDate }) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return <span className="badge badge-expired">Expired</span>;
  }

  if (diffDays <= 30) {
    return (
      <span className="badge badge-low-stock" title={`Expires in ${diffDays} days`}>
        Expiring ({diffDays}d)
      </span>
    );
  }

  if (quantity === 0) {
    return <span className="badge badge-out-of-stock">Out of Stock</span>;
  }

  if (quantity <= reorderThreshold) {
    return (
      <span className="badge badge-low-stock" title={`Low stock: ${quantity} <= ${reorderThreshold}`}>
        Low Stock
      </span>
    );
  }

  return <span className="badge badge-in-stock">In Stock</span>;
});

export default StatusBadge;
