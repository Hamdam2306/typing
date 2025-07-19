"use client"

import { useEffect, useState } from "react"
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type PaginationState,
    type SortingState,
} from "@tanstack/react-table"
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
} from "lucide-react"

import { usePagination } from "@/hooks/use-pagination"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type Item = {
    id: string
    name: string
    email: string
    location: string
    flag: string
    status: "Active" | "Inactive" | "Pending"
    balance: number
}

const columns: ColumnDef<Item>[] = [
    {
        header: "#",
        id: "index",
        cell: ({ row, table }) => {
            const pagination = table.getState().pagination;
            const globalIndex = pagination.pageIndex * pagination.pageSize + row.index + 1;
            return globalIndex;
        },
        size: 50,
        enableSorting: false,
    },

    {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
        size: 180,
    },
    {
        header: "Email",
        accessorKey: "email",
        size: 200,
    },
    {
        header: "Location",
        accessorKey: "location",
        cell: ({ row }) => (
            <div>
                <span className="text-lg leading-none">{row.original.flag}</span>{" "}
                {row.getValue("location")}
            </div>
        ),
        size: 180,
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
            <Badge
                className={cn(
                    row.getValue("status") === "Inactive" &&
                    "bg-muted-foreground/60 text-primary-foreground"
                )}
            >
                {row.getValue("status")}
            </Badge>
        ),
        size: 120,
    },
    {
        header: "Balance",
        accessorKey: "balance",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("balance"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return formatted
        },
        size: 120,
    },
]

export default function Component() {
    const pageSize = 5

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: pageSize,
    })

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: "name",
            desc: false,
        },
    ])

    const [data, setData] = useState<Item[]>([])
    useEffect(() => {
        async function fetchPosts() {
          try {
            const res = await fetch(
              "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/users-01_fertyx.json"
            );
            const fetchedData = await res.json();
            setData(fetchedData); // Remove originalIndex assignment
          } catch (error) {
            console.error("Error fetching data:", error);
            const mockData = Array.from({ length: 23 }, (_, i) => ({
              id: `${i + 1}`,
              name: `User ${i + 1}`,
              email: `user${i + 1}@example.com`,
              location: ["New York", "London", "Tokyo", "Paris", "Sydney"][i % 5],
              flag: ["🇺🇸", "🇬🇧", "🇯🇵", "🇫🇷", "🇦🇺"][i % 5],
              status: ["Active", "Inactive", "Pending"][i % 3] as "Active" | "Inactive" | "Pending",
              balance: Math.random() * 10000,
              // Remove originalIndex
            }));
            setData(mockData);
          }
        }
        fetchPosts();
      }, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        enableSortingRemoval: false,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            pagination,
        },
    })

    const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
        currentPage: table.getState().pagination.pageIndex + 1,
        totalPages: table.getPageCount(),
        paginationItemsToDisplay: 5,
    })

    return (
        <div className="space-y-4 max-w-7xl">
            <div className="bg-background overflow-hidden rounded-md">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: `${header.getSize()}px` }}
                                            className="h-11"
                                        >
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <div
                                                    className={cn(
                                                        header.column.getCanSort() &&
                                                        "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                                                    )}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    onKeyDown={(e) => {
                                                        // Enhanced keyboard handling for sorting
                                                        if (
                                                            header.column.getCanSort() &&
                                                            (e.key === "Enter" || e.key === " ")
                                                        ) {
                                                            e.preventDefault()
                                                            header.column.getToggleSortingHandler()?.(e)
                                                        }
                                                    }}
                                                    tabIndex={header.column.getCanSort() ? 0 : undefined}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: (
                                                            <ChevronUpIcon
                                                                className="shrink-0 opacity-60"
                                                                size={16}
                                                                aria-hidden="true"
                                                            />
                                                        ),
                                                        desc: (
                                                            <ChevronDownIcon
                                                                className="shrink-0 opacity-60"
                                                                size={16}
                                                                aria-hidden="true"
                                                            />
                                                        ),
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 max-sm:flex-col">
                {/* Page number information */}
                <p
                    className="text-muted-foreground flex-1 text-sm whitespace-nowrap"
                    aria-live="polite"
                >
                    Page{" "}
                    <span className="text-foreground">
                        {table.getState().pagination.pageIndex + 1}
                    </span>{" "}
                    of <span className="text-foreground">{table.getPageCount()}</span>
                </p>

                {/* Pagination buttons */}
                <div className="grow">
                    <Pagination>
                        <PaginationContent>
                            {/* Previous page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    aria-label="Go to previous page"
                                >
                                    <ChevronLeftIcon size={16} aria-hidden="true" />
                                </Button>
                            </PaginationItem>

                            {/* Left ellipsis (...) */}
                            {showLeftEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {/* Page number buttons */}
                            {pages.map((page) => {
                                const isActive =
                                    page === table.getState().pagination.pageIndex + 1
                                return (
                                    <PaginationItem key={page}>
                                        <Button
                                            size="icon"
                                            variant={`${isActive ? "outline" : "ghost"}`}
                                            onClick={() => table.setPageIndex(page - 1)}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            {page}
                                        </Button>
                                    </PaginationItem>
                                )
                            })}

                            {/* Right ellipsis (...) */}
                            {showRightEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {/* Next page button */}
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="disabled:pointer-events-none disabled:opacity-50"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    aria-label="Go to next page"
                                >
                                    <ChevronRightIcon size={16} aria-hidden="true" />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>

                {/* Results per page */}
                <div className="flex flex-1 justify-end">
                    <Select
                        value={table.getState().pagination.pageSize.toString()}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                        aria-label="Results per page"
                    >
                        <SelectTrigger
                            id="results-per-page"
                            className="w-fit whitespace-nowrap"
                        >
                            <SelectValue placeholder="Select number of results" />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 25, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={pageSize.toString()}>
                                    {pageSize} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

        </div>
    )
}