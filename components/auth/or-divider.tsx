const OrDivider = () => {
  return (
    <div className="relative flex items-center justify-center my-4">
      <div className="absolute border-t border-gray-300 w-full"></div>
      <div className="relative bg-background px-4 text-sm text-muted-foreground">
        OR
      </div>
    </div>
  );
};

export default OrDivider;
