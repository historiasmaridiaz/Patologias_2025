import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
  MRT_Localization,
} from "material-react-table";
import fondoFormulario from '../assets/imagen.jpeg';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { HISTORIAS_CLINICAS_SERVER } from '../config/historiasClinicas';

// Localización completa en español para Material React Table
const MRT_Localization_ES: Partial<MRT_Localization> = {
  actions: 'Acciones',
  and: 'y',
  cancel: 'Cancelar',
  changeFilterMode: 'Cambiar modo de filtro',
  changeSearchMode: 'Cambiar modo de búsqueda',
  clearFilter: 'Limpiar filtro',
  clearSearch: 'Limpiar búsqueda',
  clearSort: 'Limpiar ordenamiento',
  clickToCopy: 'Hacer clic para copiar',
  collapse: 'Contraer',
  collapseAll: 'Contraer todo',
  columnActions: 'Acciones de columna',
  copiedToClipboard: 'Copiado al portapapeles',
  dropToGroupBy: 'Soltar para agrupar por {column}',
  edit: 'Editar',
  expand: 'Expandir',
  expandAll: 'Expandir todo',
  filterArrIncludes: 'Incluye',
  filterArrIncludesAll: 'Incluye todo',
  filterArrIncludesSome: 'Incluye alguno',
  filterBetween: 'Entre',
  filterBetweenInclusive: 'Entre (inclusivo)',
  filterByColumn: 'Filtrar por {column}',
  filterContains: 'Contiene',
  filterEmpty: 'Vacío',
  filterEndsWith: 'Termina con',
  filterEquals: 'Igual a',
  filterEqualsString: 'Igual a',
  filterFuzzy: 'Búsqueda difusa',
  filterGreaterThan: 'Mayor que',
  filterGreaterThanOrEqualTo: 'Mayor o igual que',
  filterInNumberRange: 'En rango numérico',
  filterIncludesString: 'Incluye',
  filterIncludesStringSensitive: 'Incluye (sensible)',
  filterLessThan: 'Menor que',
  filterLessThanOrEqualTo: 'Menor o igual que',
  filterMode: 'Modo de filtro: {filterType}',
  filterNotEmpty: 'No vacío',
  filterNotEquals: 'No igual a',
  filterStartsWith: 'Comienza con',
  filterWeakEquals: 'Igual',
  filteringByColumn: 'Filtrando por {column} - {filterType} - {filterValue}',
  goToFirstPage: 'Ir a la primera página',
  goToLastPage: 'Ir a la última página',
  goToNextPage: 'Ir a la página siguiente',
  goToPreviousPage: 'Ir a la página anterior',
  grab: 'Agarrar',
  groupByColumn: 'Agrupar por {column}',
  groupedBy: 'Agrupado por ',
  hideAll: 'Ocultar todo',
  hideColumn: 'Ocultar columna {column}',
  max: 'Máximo',
  min: 'Mínimo',
  move: 'Mover',
  noRecordsToDisplay: 'No hay fechas para mostrar',
  noResultsFound: 'No se encontraron resultados',
  of: 'de',
  or: 'o',
  pinToLeft: 'Anclar a la izquierda',
  pinToRight: 'Anclar a la derecha',
  resetColumnSize: 'Restablecer tamaño de columna',
  resetOrder: 'Restablecer orden',
  rowActions: 'Acciones de fila',
  rowNumber: '#',
  rowNumbers: 'Números de fila',
  rowsPerPage: 'Filas por página',
  save: 'Guardar',
  search: 'Buscar',
  select: 'Seleccionar',
  selectedCountOfRowCountRowsSelected: '{selectedCount} de {rowCount} filas seleccionadas',
  showAll: 'Mostrar todo',
  showAllColumns: 'Mostrar todas las columnas',
  showHideColumns: 'Mostrar/Ocultar columnas',
  showHideFilters: 'Mostrar/Ocultar filtros',
  showHideSearch: 'Mostrar/Ocultar búsqueda',
  sortByColumnAsc: 'Ordenar por {column} ascendente',
  sortByColumnDesc: 'Ordenar por {column} descendente',
  sortedByColumnAsc: 'Ordenado por {column} ascendente',
  sortedByColumnDesc: 'Ordenado por {column} descendente',
  thenBy: ', luego por ',
  toggleDensity: 'Alternar densidad',
  toggleFullScreen: 'Alternar pantalla completa',
  toggleSelectAll: 'Alternar seleccionar todo',
  toggleSelectRow: 'Alternar selección de fila',
  toggleVisibility: 'Alternar visibilidad',
  ungroupByColumn: 'Desagrupar por {column}',
  unpin: 'Desanclar',
  unpinAll: 'Desanclar todo',
};

// Interfaz para los datos de Patologias_2026
interface IPatologias {
  id: string;
  fecha: string;
  tipo: string;
  tipoDocumento: string;
  documento: string;
  nombres: string;
  fechaRecibido: string;
  fechaEntrega: string;
  parentesco: string;
  observaciones: string;
}

function TablePatologias() {
  const [data, setData] = useState<IPatologias[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<IPatologias | null>(null);

  // Estados para los campos del formulario
  const [fecha, setFecha] = useState('');
  const [tipo, setTipo] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [documento, setDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [fechaRecibido, setFechaRecibido] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Recepción automática desde Historias Clínicas Proinsalud
  // Ejemplo:
  // http://localhost:5173/?tipoDocumento=CC&documento=123&nombres=JUAN%20PEREZ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipoDoc = params.get('tipoDocumento') || params.get('tipo_doc') || '';
    const doc = params.get('documento') || params.get('cedula') || '';
    const nombre = params.get('nombres') || params.get('nombre') || '';

    if (tipoDoc || doc || nombre) {
      setTipoDocumento(tipoDoc.toUpperCase());
      setDocumento(doc);
      setNombres(nombre.toUpperCase());
      setOpen(true);
      console.log('Datos recibidos desde Historias Clínicas:', {
        servidor: HISTORIAS_CLINICAS_SERVER.baseUrl,
        tipoDoc,
        doc,
        nombre
      });
    }
  }, []);


  // Opciones para los selects
  const tipoOptions = ['VARIAS', 'GASTRICAS'];
  const tipoDocumentoOptions = ['CC', 'TI', 'RC'];
  const parentescoOptions = [
    'PERSONAL', 'COMPAÑERO', 'ESPOSO(A)', 'PADRE', 'MADRE', 'HIJO', 'HIJA', 'ABUELOS', 'ABUELA',
    'HERMANO', 'HERMANA', 'TIO', 'TIA', 'PRIMO', 'PRIMA', 'SOBRINO', 'SOBRINA', 'CUÑADO',
    'CUÑADA', 'SUEGRO', 'SUEGRA', 'YERNO', 'NIETI@', 'DOMICILIARIO', 'VECINO',
    'COMPAÑERO DE TRABAJO', 'OTRO'
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Función para generar el siguiente ID numérico
  const getNextId = (): number => {
    if (data.length === 0) return 1;
    const maxId = Math.max(...data.map(item => parseInt(item.id) || 0));
    return maxId + 1;
  };

  // Función para obtener fecha y hora actual formateada (Colombia Time, UTC-05:00)
  const getCurrentDateTime = (): string => {
    const now = new Date();
    const colombiaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
    const year = colombiaTime.getFullYear();
    const month = String(colombiaTime.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(colombiaTime.getDate()).padStart(2, '0');
    const hours = String(colombiaTime.getHours()).padStart(2, '0');
    const minutes = String(colombiaTime.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`; // Formato 'YYYY-MM-DDTHH:mm' para datetime-local
  };

  // Función para validar que el input sea solo numérico
  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  // Autocompletado manual/ENTER desde Historias Clínicas
  const completarDesdeIntranet = async () => {
    if (!documento) {
      alert('Digite un número de documento.');
      return;
    }
    try {
      const url = `${HISTORIAS_CLINICAS_SERVER.baseUrl}/buscar?documento=${documento}&tipo=${tipoDocumento || 'CC'}`;
      console.log('Consultando Historias Clínicas:', url);
      const response = await axios.get(url);
      const paciente = response.data?.data || response.data;

      if (paciente.tipo_doc) setTipoDocumento(String(paciente.tipo_doc).toUpperCase());
      if (paciente.cedula) setDocumento(String(paciente.cedula));
      if (paciente.nombre) setNombres(String(paciente.nombre).toUpperCase());
      alert('Paciente cargado correctamente');
    } catch (error) {
      console.error(error);
      alert('No fue posible completar desde Intranet.');
    }
  };

  // Función para abrir modal de edición
  const handleEdit = (row: IPatologias) => {
    setEditingRow(row);
    // Convertir fecha al formato datetime-local si existe
    const dateTime = row.fecha ? new Date(row.fecha).toISOString().slice(0, 16) : getCurrentDateTime();
    setFecha(dateTime);
    setTipo(row.tipo);
    setTipoDocumento(row.tipoDocumento);
    setDocumento(row.documento);
    setNombres(row.nombres);
    setFechaRecibido(row.fechaRecibido);
    setFechaEntrega(row.fechaEntrega);
    setParentesco(row.parentesco);
    setObservaciones(row.observaciones);
    setOpen(true);
  };

  // Función para eliminar un registro
  const handleDelete = async (row: IPatologias) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el registro con ID ${row.id}?`)) return;

    setLoading(true);
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbxCBh60dT2ceUUNMqtaCeGut0S_EnO1NvhfwTyfuzTMlNxz-oocHT5SRXVje8HCDBgBHA/exec';

    const params = new URLSearchParams({
      action: 'delete',
      id: row.id,
    });

    try {
      const response = await axios.get(`${GAS_URL}?${params.toString()}`);
      if (response.data.success) {
        alert("Registro eliminado correctamente");
        fetchData();
      } else {
        throw new Error(response.data.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error("Error al eliminar el registro:", error);
      alert("Hubo un error al eliminar el registro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar formulario
  const clearForm = () => {
    // Establecer fecha actual automáticamente para nuevos registros
    setFecha(getCurrentDateTime());
    setTipo('');
    setTipoDocumento('');
    setDocumento('');
    setNombres('');
    setFechaRecibido('');
    setFechaEntrega('');
    setParentesco('');
    setObservaciones('');
    setEditingRow(null);
  };

  const handleSubmit = async () => {
    // Validar campos obligatorios siempre
    if (!tipo || !tipoDocumento || !documento || !nombres || !fechaRecibido || !fechaEntrega || !parentesco) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbxCBh60dT2ceUUNMqtaCeGut0S_EnO1NvhfwTyfuzTMlNxz-oocHT5SRXVje8HCDBgBHA/exec';

    const action = editingRow ? 'edit' : 'add';
    const id = editingRow ? editingRow.id : getNextId().toString();
    
    // Usar la fecha seleccionada o actual si no se modifica
    const fechaActual = fecha || getCurrentDateTime();

    const params = new URLSearchParams({
      action,
      id,
      fecha: fechaActual,
      tipo,
      tipoDocumento,
      documento,
      nombres,
      fechaRecibido,
      fechaEntrega,
      parentesco,
      observaciones: observaciones || '',
    });

    try {
      console.log('Enviando datos:', Object.fromEntries(params));
      const response = await axios.get(`${GAS_URL}?${params.toString()}`);
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        alert(editingRow ? "Registro actualizado correctamente" : "Registro agregado correctamente");
        setOpen(false);
        clearForm();
        fetchData();
      } else {
        throw new Error(response.data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error("Error completo:", error);
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      alert("Hubo un error al guardar los datos: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    const API_KEY = 'AIzaSyDZB-Qp4gJJ-fhDT9IlFiSnCCgfai2e2hA';
    const SHEET_ID = '1UYY65Y_7dcI2Icd04-17vHRipM1SYhlO6Udgr8XNO-Y';
    const RANGE = "Patologias_2025";

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    try {
      const response = await axios.get(url);
      const rows = response.data.values || [];

      const formattedData: IPatologias[] = rows.slice(1).map((row: string[]) => ({
        id: row[0] || "",
        fecha: row[1] || "",
        tipo: row[2] || "",
        tipoDocumento: row[3] || "",
        documento: row[4] || "",
        nombres: row[5] || "",
        fechaRecibido: row[6] || "",
        fechaEntrega: row[7] || "",
        parentesco: row[8] || "",
        observaciones: row[9] || "",
      }));

      setData(formattedData);
    } catch (error: any) {
      console.error("Error al obtener datos de la hoja:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo<MRT_ColumnDef<IPatologias>[]>(() => [
    { accessorKey: "id", header: "ID", size: 60 },
    { accessorKey: "fecha", header: "FECHA", size: 180 },
    { accessorKey: "tipo", header: "TIPO", size: 100 },
    { accessorKey: "tipoDocumento", header: "TIPO DOCUMENTO", size: 120 },
    { accessorKey: "documento", header: "DOCUMENTO", size: 120 },
    { accessorKey: "nombres", header: "NOMBRES Y APELLIDOS", size: 200 },
    { accessorKey: "fechaRecibido", header: "FECHA RECIBIDO", size: 140 },
    { accessorKey: "fechaEntrega", header: "FECHA ENTREGA", size: 140 },
    { accessorKey: "parentesco", header: "PARENTESCO", size: 120 },
    { accessorKey: "observaciones", header: "OBSERVACIONES", size: 200 },
  ], []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patologias_2025');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'Patologias_2025.xlsx');
  };

  const table = useMaterialReactTable({
    columns,
    data,
    localization: MRT_Localization_ES,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableSorting: true,
    enableDensityToggle: true,
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
      density: 'compact',
    },
    muiSearchTextFieldProps: {
      placeholder: 'Buscar en todos los campos...',
      size: 'small',
      variant: 'outlined',
      InputLabelProps: {
        shrink: true,
      },
      sx: {
        minWidth: isMobile ? '100%' : '600px',
        maxWidth: isMobile ? '100%' : '800px',
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          backgroundColor: '#ffffffa9',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#f5f5f544',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff7f',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(102,126,234,0.3)'
          }
        }
      }
    },
    muiPaginationProps: {
      showFirstButton: true,
      showLastButton: true,
      SelectProps: {
        native: false,
      },
    },
    renderTopToolbarCustomActions: () => (
      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center">
        <Button 
          onClick={() => {
            clearForm();
            setOpen(true);
          }} 
          variant="contained"
          startIcon={<AddIcon />}
          disabled={loading}
          sx={{
            borderRadius: '8px',
            px: isMobile ? 2 : 5,
            py: isMobile ? 0.5 : 1.8,
            fontSize: isMobile ? '0.9rem' : '1.1rem',
            fontWeight: '700',
            textTransform: 'none',
            background: 'linear-gradient(135deg, #002df7ff 0%, #0795edff 100%)',
            boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #00ff19ff 0%, #667eea 100%)',
              transform: 'translateY(-3px)',
              boxShadow: '0 10px 30px rgba(102,126,234,0.6)'
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #ccc, #999)',
              color: 'white'
            }
          }}
        >
          Agregar Registro
        </Button>
        <Button 
          onClick={exportToExcel}
          variant="outlined"
          sx={{ borderRadius: '8px', px: isMobile ? 2 : 4 }}
        >
          📥 Descargar Excel
        </Button>
        <Button 
          onClick={() => window.open('https://docs.google.com/spreadsheets/d/1UYY65Y_7dcI2Icd04-17vHRipM1SYhlO6Udgr8XNO-Y/edit?gid=0#gid=0', '_blank')}
          variant="outlined"
          sx={{ borderRadius: '8px', px: isMobile ? 2 : 4 }}
        >
          🔗 Ver Drive
        </Button>
      </Stack>
    ),
    enableRowActions: true,
    positionActionsColumn: 'first',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Editar registro">
          <IconButton 
            onClick={() => handleEdit(row.original)}
            sx={{
              color: '#667eea',
              '&:hover': {
                backgroundColor: 'rgba(102,126,234,0.1)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar registro">
          <IconButton 
            onClick={() => handleDelete(row.original)}
            sx={{
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211,47,47,0.1)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    muiTableContainerProps: {
      sx: {
        minWidth: '100%',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#888',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
        },
      }
    },
    muiTableProps: {
      sx: {
        tableLayout: 'auto',
        width: '100%',
        [theme.breakpoints.down('sm')]: {
          fontSize: '0.75rem',
        },
      }
    },
    muiTableBodyProps: {
      sx: {
        '& .MuiTableRow-root:only-child .MuiTableCell-root': {
          textAlign: 'center',
          fontSize: '1.2rem',
          color: 'text.secondary',
          fontWeight: '500',
        },
        '& .MuiTableRow-root': {
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
        '& .MuiTableCell-root': {
          fontSize: '0.9rem',
          padding: isMobile ? '4px 8px' : '1px 16px',
          borderBottom: '1px solid #e0e0e0',
          textAlign: 'left',
          whiteSpace: 'normal',
          minWidth: '100px',
          [theme.breakpoints.down('sm')]: {
            padding: '2px 4px',
            fontSize: '0.7rem',
          },
        },
      }
    }
  });

  return (
    <Container maxWidth={false} sx={{ py: 2, width: '100%', [theme.breakpoints.down('sm')]: { px: 1 } }}>
      <Box sx={{ textAlign: 'center', mb: 2, [theme.breakpoints.down('sm')]: { mb: 1 } }}>
        <Typography 
          variant="h3" 
          component="h1"
          sx={{
            fontWeight: '700',
            color: '#030303ff',
            WebkitTextStroke: '1px white',
            mb: 1,
            display: 'inline-block',
            [theme.breakpoints.down('sm')]: {
              fontSize: '1.5rem',
            },
          }}
        >
          📊 BASE DE DATOS PATOLOGIAS 2026 V1
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontWeight: '400', [theme.breakpoints.down('sm')]: { fontSize: '0.9rem' } }}
        >
          Sistema de Gestión y Control de Patologias
        </Typography>
      </Box>

      <MaterialReactTable table={table} />

      <Dialog 
        open={open} 
        onClose={() => {
          setOpen(false);
          clearForm();
        }} 
        fullScreen={true}
        PaperProps={{
          sx: {
            backgroundImage: `url(${fondoFormulario})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            [theme.breakpoints.down('sm')]: {
              height: '100vh',
            },
          }
        }}
      >

        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: 'bold',
            py: isMobile ? 2 : 3,
            color: '#000000dc',
            borderBottom: '1px solid #e0e0e049',
          }}
        >
          {editingRow ? '✏️ Editar Carpeta' : '📋 Registrar Carpeta'}
        </DialogTitle>

        <DialogContent sx={{ px: isMobile ? 2 : 6, py: isMobile ? 2 : 4, backgroundColor: 'transparent' }}>

          <TextField
            label="📅 FECHA DE REGISTRO"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            type="datetime-local"
            error={!fecha}
            disabled={!editingRow}
            InputLabelProps={{ shrink: true }}
            sx={{
              mb: 2,
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '5px',
                backgroundColor: editingRow ? '#fff' : '#f5f5f5',
                '& input': { 
                  color: editingRow ? '#000' : '#666',
                },
                [theme.breakpoints.down('sm')]: {
                  fontSize: '0.8rem',
                },
              },
              '& .MuiInputLabel-root': { fontWeight: '600', color: '#333' },
              '& .MuiFormHelperText-root': { color: '#333' },
            }}
            helperText={
              editingRow 
                ? "Puedes modificar la fecha y hora" 
                : "Fecha y hora se establece automáticamente"
            }
          />

          <Stack spacing={isMobile ? 1 : 3} mt={isMobile ? 1 : 2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 1 : 2 }}>
              <FormControl required error={!tipo} sx={{ minWidth: isMobile ? '100%' : 145 }}>
                <InputLabel id="tipo-label" sx={{ fontWeight: '600', color: '#333', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  📚 TIPO BIOPSIA
                </InputLabel>
                <Select
                  labelId="tipo-label"
                  value={tipo}
                  label="TIPO BIOPSIA"
                  onChange={(e) => setTipo(e.target.value)}
                  sx={{
                    borderRadius: '5px',
                    backgroundColor: '#fff',
                    '& .MuiSelect-select': { color: '#000', fontSize: isMobile ? '0.9rem' : '1rem' },
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccionar
                  </MenuItem>
                  {tipoOptions.map((option) => (
                    <MenuItem key={option} value={option} sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {!tipo && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                    Campo obligatorio
                  </Typography>
                )}
              </FormControl>

              <FormControl required error={!tipoDocumento} sx={{ minWidth: isMobile ? '100%' : 130 }}>
                <InputLabel id="tipoDocumento-label" sx={{ fontWeight: '600', color: '#333', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  📁 TIPO DOCUMENTO
                </InputLabel>
                <Select
                  labelId="tipoDocumento-label"
                  value={tipoDocumento}
                  label="TIPO DOCUMENTO"
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  sx={{
                    borderRadius: '5px',
                    backgroundColor: '#fff',
                    '& .MuiSelect-select': { color: '#000', fontSize: isMobile ? '0.9rem' : '1rem' },
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccionar
                  </MenuItem>
                  {tipoDocumentoOptions.map((option) => (
                    <MenuItem key={option} value={option} sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {!tipoDocumento && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                    Campo obligatorio
                  </Typography>
                )}
              </FormControl>

              <TextField
                label="📄 No DOCUMENTO"
                value={documento}
                onChange={(e) => handleNumericInput(e.target.value, setDocumento)}
                required
                error={!documento}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1 }}
                sx={{
                  mb: isMobile ? 1 : 0,
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '5px',
                    backgroundColor: '#fff',
                    '& input': { color: '#000', fontSize: isMobile ? '0.9rem' : '1rem' },
                  },
                  '& .MuiInputLabel-root': { fontWeight: '600', color: '#333', fontSize: isMobile ? '0.9rem' : '1rem' },
                  '& .MuiFormHelperText-root': { color: '#333', fontSize: isMobile ? '0.7rem' : '0.8rem' },
                }}
                helperText={!documento ? "Campo obligatorio - Solo números" : "Solo números"}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    completarDesdeIntranet();
                  }
                }}
              />

              <Button
                variant="outlined"
                onClick={completarDesdeIntranet}
                sx={{ mt: 1, height: 40 }}
              >
                🔎 Completar desde Intranet
              </Button>
            </Box>

            <TextField
              label="👤 NOMBRES Y APELLIDOS"
              value={nombres}
              onChange={(e) => setNombres(e.target.value.toUpperCase())}
              required
              error={!nombres}
              sx={{
                mb: isMobile ? 1 : 0,
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '5px',
                  backgroundColor: '#fff',
                  '& input': { color: '#000', fontSize: isMobile ? '0.9rem' : '1rem' },
                },
                '& .MuiInputLabel-root': { fontWeight: '600', color: '#333', fontSize: isMobile ? '0.9rem' : '1rem' },
                '& .MuiFormHelperText-root': { color: '#333', fontSize: isMobile ? '0.7rem' : '0.8rem' },
              }}
              helperText={!nombres ? "Campo obligatorio" : ""}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 1 : 2 }}>
              <TextField
                label="📅 FECHA DE RECIBIDO"
                value={fechaRecibido}
                onChange={(e) => setFechaRecibido(e.target.value)}
                required
                type="date"
                error={!fechaRecibido}
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: isMobile ? 1 : 0,
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '5px',
                    backgroundColor: '#fff',
                    '& input': { color: '#000', fontSize: isMobile ? '0.9rem' : '1rem' },
                  },
                  '& .MuiInputLabel-root': { fontWeight: '600', color: '#333', fontSize: isMobile ? '0.9rem' : '1rem' },
                  '& .MuiFormHelperText-root': { color: '#333', fontSize: isMobile ? '0.7rem' : '0.8rem' },
                }}
                helperText={!fechaRecibido ? "Campo obligatorio" : ""}
              />

              <TextField
                label="📅 FECHA DE ENTREGA"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                required
                type="date"
                error={!fechaEntrega}
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: isMobile ? 1 : 0,
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '5px',
                    backgroundColor: '#fff',
                    '& input': { color: '#000', fontSize: isMobile ? '0.9rem' : '1rem' },
                  },
                  '& .MuiInputLabel-root': { fontWeight: '600', color: '#333', fontSize: isMobile ? '0.9rem' : '1rem' },
                  '& .MuiFormHelperText-root': { color: '#333', fontSize: isMobile ? '0.7rem' : '0.8rem' },
                }}
                helperText={!fechaEntrega ? "Campo obligatorio" : ""}
              />

              <FormControl required error={!parentesco} sx={{ minWidth: isMobile ? '100%' : 250 }}>
                <InputLabel id="parentesco-label" sx={{ fontWeight: '600', color: '#333', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  👨‍👩‍👧 PARENTESCO
                </InputLabel>
                <Select
                  labelId="parentesco-label"
                  value={parentesco}
                  label="PARENTESCO"
                  onChange={(e) => setParentesco(e.target.value)}
                  sx={{
                    borderRadius: '5px',
                    backgroundColor: '#fff',
                    '& .MuiSelect-select': { color: '#000', fontSize: isMobile ? '0.9rem' : '1rem' },
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccionar
                  </MenuItem>
                  {parentescoOptions.map((option) => (
                    <MenuItem key={option} value={option} sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {!parentesco && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                    Campo obligatorio
                  </Typography>
                )}
              </FormControl>
            </Box>

            <TextField
              label="💭 OBSERVACIONES"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value.toUpperCase())}
              multiline
              rows={isMobile ? 2 : 2}
              sx={{
                mb: isMobile ? 1 : 0,
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '5px',
                  backgroundColor: '#fff',
                  '& textarea': { color: '#000', fontSize: isMobile ? '0.9rem' : '1rem' },
                },
                '& .MuiInputLabel-root': { fontWeight: '600', color: '#333', fontSize: isMobile ? '0.9rem' : '1rem' },
                '& .MuiFormHelperText-root': { color: '#333', fontSize: isMobile ? '0.7rem' : '0.8rem' },
              }}
              helperText="Campo opcional - Información adicional"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: isMobile ? 2 : 6, pb: isMobile ? 2 : 4, justifyContent: 'center', gap: isMobile ? 1 : 3, backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <Button
            onClick={() => {
              setOpen(false);
              clearForm();
            }}
            variant="outlined"
            sx={{
              borderRadius: '5px',
              px: isMobile ? 2 : 4,
              py: isMobile ? 0.5 : 1,
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '600',
              textTransform: 'none',
              borderColor: '#6c757d',
              color: '#6c757d',
              '&:hover': {
                borderColor: '#5a6268',
                color: '#5a6268',
                backgroundColor: 'rgba(108,117,125,0.1)',
              },
            }}
          >
            Cerrar
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: '5px',
              px: isMobile ? 2 : 4,
              py: isMobile ? 0.5 : 1,
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '600',
              textTransform: 'none',
              backgroundColor: '#007bff',
              '&:hover': {
                backgroundColor: '#0056b3',
              },
              '&:disabled': {
                backgroundColor: '#6c757d',
              },
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : editingRow ? 'Actualizar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TablePatologias;