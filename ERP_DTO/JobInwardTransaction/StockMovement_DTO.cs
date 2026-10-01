using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class StockMovementFilter_DTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public long? ItemGroupNumber { get; set; }
        public long? WarehouseNumber { get; set; }
        public long? ItemNumber { get; set; }
    }

    public class StockMovementRow_DTO
    {
        public string ItemGroupName { get; set; }
        public string ItemNumber { get; set; }   // actually the Item Code text
        public decimal OpeningQty { get; set; }
        public decimal InwardQty { get; set; }
        public decimal OutwardQty { get; set; }
        public decimal ClosingQty { get; set; }
    }

    public class StockMovementReport_DTO
    {
        public StockMovementFilter_DTO Filter { get; set; } = new();
        public List<StockMovementRow_DTO> Rows { get; set; } = new();

        public decimal TotalOpening => Rows.Sum(r => r.OpeningQty);
        public decimal TotalInward => Rows.Sum(r => r.InwardQty);
        public decimal TotalOutward => Rows.Sum(r => r.OutwardQty);
        public decimal TotalClosing => Rows.Sum(r => r.ClosingQty);
    }
}
