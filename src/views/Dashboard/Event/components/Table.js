import { Box, Flex, FormControl, IconButton, Switch, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { formatDate } from 'utils/helpers';
import { BiCommentDetail } from 'react-icons/bi';
import { ModalType } from 'constants/common';
import { DeleteIcon } from '@chakra-ui/icons';
import { usePublishEventMutation } from 'services/event';

const SizeTable = ({ data, handleUpdateCategory, refetch }) => {
  const [sorting, setSorting] = useState([]);
  const columnHelper = createColumnHelper();
  const publishEventMutation = usePublishEventMutation()
  const handlePushlish = async event => {
    if (event.isPublished) {
      const confirmMessage = window.confirm(`Event is already published!`);
      if (!confirmMessage) {
        return;
      }
    } else {
      const confirmMessage = window.confirm(`Do you want to pushlish this event?`);
      if (!confirmMessage) {
        return;
      }

      publishEventMutation.mutate(
        { id: event.id },
        {
          onSuccess: () => {
            const successMessage = `Pushlish event successfully`;
            toast.showMessageSuccess(successMessage);
            refetch?.();
          },
          onError: () => {
            const errorMessage = `Pushlish event unsuccessfully`;
            toast.showMessageError(errorMessage);
            refetch?.();
          },
        }
      );
    }
  };
  const handleRowClick = (ticket, type) => {
    handleUpdateCategory(ticket, type);
  };
  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Tiêu đề',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('location', {
        header: 'Địa điểm',
        cell: info => info.getValue(),
      }),

      columnHelper.accessor('startDateTime', {
        header: 'Bắt đầu',
        cell: info => <Text whiteSpace={'nowrap'}>{formatDate(info.row.original.startDateTime, 'DD.MM.YYYY hA')}</Text>,
      }),

      columnHelper.accessor('endDateTime', {
        header: 'Hết thúc',
        cell: info => <Text whiteSpace={'nowrap'}>{formatDate(info.row.original.endDateTime, 'DD.MM.YYYY hA')}</Text>,
      }),

      columnHelper.accessor('price', {
        header: 'Giá vé',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('isFree', {
        header: 'Miễn phí',
        cell: info => (
          <FormControl display="flex" alignItems="center">
            <Switch isChecked={info.row.original.isFree} />
          </FormControl>
        ),
      }),
      columnHelper.accessor('isPublished', {
        header: 'Công bố',
        cell: info => (
          <FormControl display="flex" alignItems="center">
            <Switch isChecked={info.row.original.isPublished} onChange={() => handlePushlish(info.row.original)} />
          </FormControl>
        ),
      }),
      columnHelper.accessor('author', {
        header: 'Người tạo',
        cell: info => info.getValue().email,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Ngày tạo',
        cell: info => <Text whiteSpace={'nowrap'}>{formatDate(info.row.original.createdAt, 'DD.MM.YYYY hA')}</Text>,
      }),
      columnHelper.accessor('action', {
        header: '',
        cell: info => (
          <Flex alignItems="center" gap={1}>
            <IconButton
              bg="transparent"
              onClick={() => {
                handleRowClick(info?.row?.original, ModalType.Add);
              }}
            >
              <DeleteIcon cursor="pointer" size={18} />
            </IconButton>
          </Flex>
        ),
      }),
    ],
    [data]
  );

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <Table>
      <Thead>
        {table.getHeaderGroups().map(headerGroup => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <Th key={header.id} w="120px">
                {header.isPlaceholder ? null : (
                  <Box cursor={header.column.getCanSort() ? 'pointer' : 'default'} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
                  </Box>
                )}
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {isEmpty(table.getRowModel().rows) ? (
          <Tr>
            <Td textAlign="center" colSpan={10}>
              Không có dữ liệu
            </Td>
          </Tr>
        ) : (
          table.getRowModel().rows.map(row => (
            <Tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
              ))}
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );
};

export default SizeTable;
