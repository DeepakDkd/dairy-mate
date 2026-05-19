export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const rawPageSize = searchParams.get("pageSize") ?? searchParams.get("limit") ?? "10";
  const pageSize = Math.max(Number(rawPageSize), 1);

  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    skip,
    take: pageSize,
  };
}
