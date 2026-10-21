using ERP_DTO.ProductionTransaction;
using System;
using System.Collections.Generic;
using System.Data;

namespace ERP_DL
{
    public class WarehouseTransfer_DL
    {
        // ---------- helpers ----------
        private static bool Has(DataRow dr, string col) => dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value;

        private static long L(DataRow dr, string col) => Has(dr, col) ? Convert.ToInt64(dr[col]) : 0;
        private static long? LN(DataRow dr, string col) => Has(dr, col) ? Convert.ToInt64(dr[col]) : (long?)null;
        private static int I(DataRow dr, string col) => Has(dr, col) ? Convert.ToInt32(dr[col]) : 0;
        private static int? IN(DataRow dr, string col) => Has(dr, col) ? Convert.ToInt32(dr[col]) : (int?)null;
        private static decimal D(DataRow dr, string col) => Has(dr, col) ? Convert.ToDecimal(dr[col]) : 0m;
        private static decimal? DN(DataRow dr, string col) => Has(dr, col) ? Convert.ToDecimal(dr[col]) : (decimal?)null;
        private static string S(DataRow dr, string col) => Has(dr, col) ? Convert.ToString(dr[col]) : null;
        private static string Dt(DataRow dr, string col) => Has(dr, col) ? Convert.ToDateTime(dr[col]).ToString("dd-MM-yyyy") : null;

        // ---------- masters (WHT_SP Id 1) : table 0 = UoM, table 1 = Warehouse ----------
        public List<WarehouseTransferUoM_DTO> UoMList(DataSet ds)
        {
            var list = new List<WarehouseTransferUoM_DTO>();
            if (ds == null || ds.Tables.Count < 1) return list;

            foreach (DataRow dr in ds.Tables[0].Rows)
                list.Add(new WarehouseTransferUoM_DTO
                {
                    UnitNumber = L(dr, "UnitNumber"),
                    UnitCode = S(dr, "UnitCode"),
                    DecimalPlaces = I(dr, "DecimalPlaces")
                });
            return list;
        }

        public List<WarehouseTransferWarehouse_DTO> WarehouseList(DataSet ds)
        {
            var list = new List<WarehouseTransferWarehouse_DTO>();
            if (ds == null || ds.Tables.Count < 2) return list;

            foreach (DataRow dr in ds.Tables[1].Rows)
                list.Add(new WarehouseTransferWarehouse_DTO
                {
                    WarehouseNumber = L(dr, "WarehouseNumber"),
                    WarehouseCode = S(dr, "WarehouseCode")
                });
            return list;
        }

        // ---------- Material Segregation (WHT_SP Id 1, table 2) ----------
        public List<WarehouseTransferMS_DTO> MSList(DataSet ds)
        {
            var list = new List<WarehouseTransferMS_DTO>();
            if (ds == null || ds.Tables.Count < 3) return list;

            foreach (DataRow dr in ds.Tables[2].Rows)
                list.Add(new WarehouseTransferMS_DTO
                {
                    Number = L(dr, "Number"),
                    Segregation = S(dr, "Segregation")
                });
            return list;
        }

        // ---------- batch popup (WHT_GetBatch_SP) ----------
        public List<WarehouseTransferBatchList_DTO> BatchList(DataSet ds)
        {
            var list = new List<WarehouseTransferBatchList_DTO>();
            if (ds == null || ds.Tables.Count < 1) return list;

            foreach (DataRow dr in ds.Tables[0].Rows)
                list.Add(new WarehouseTransferBatchList_DTO
                {
                    LineBatch_Number = L(dr, "LineBatch_Number"),
                    FromWarehouse = L(dr, "FromWarehouse"),
                    BatchDate = Has(dr, "BatchDate") ? Convert.ToDateTime(dr["BatchDate"]) : DateTime.MinValue,
                    BatchNo = S(dr, "BatchNo"),
                    BatchQty = D(dr, "BatchQty"),
                    ReservedQty = D(dr, "ReservedQty"),
                    DeliveredQty = D(dr, "DeliveredQty"),
                    AvailableQty = D(dr, "AvailableQty"),
                    BatchUnitPrice = D(dr, "BatchUnitPrice"),
                    BatchValue = D(dr, "BatchValue"),
                    WarehouseCode = S(dr, "WarehouseCode"),
                    ItemStatus = S(dr, "ItemStatus")
                });
            return list;
        }
        // ---------- numbering setup (WHT_Numbering_SP Id 1) ----------
        public List<WarehouseTransferNumberReset_DTO> WHTRList(DataTable Dt)
        {
            var list = new List<WarehouseTransferNumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
                list.Add(new WarehouseTransferNumberReset_DTO
                {
                    WHTR_Number = L(dr, "WHTR_Number"),
                    WHTR_Date = S(dr, "WHTR_Date"),
                    WHTR_EndDate = S(dr, "WHTR_EndDate"),
                    WHTR_StartingNumber = I(dr, "WHTR_StartingNumber"),
                    WHTR_NumberofDigits = I(dr, "WHTR_NumberofDigits"),
                    WHTR_PrefilZero = L(dr, "WHTR_PrefilZero"),
                    WHTR_Frequency = L(dr, "WHTR_Frequency"),
                    WHTR_IsDeleted = false
                });
            return list;
        }

        public List<WarehouseTransferNumberPrefix_DTO> WHTPList(DataTable Dt)
        {
            var list = new List<WarehouseTransferNumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
                list.Add(new WarehouseTransferNumberPrefix_DTO
                {
                    WHTP_Number = L(dr, "WHTP_Number"),
                    WHTP_Date = S(dr, "WHTP_Date"),
                    WHTP_EndDate = S(dr, "WHTP_EndDate"),
                    WHTP_Particulars = S(dr, "WHTP_Particulars"),
                    WHTP_IsDeleted = false
                });
            return list;
        }

        public List<WarehouseTransferNumberSuffix_DTO> WHTSList(DataTable Dt)
        {
            var list = new List<WarehouseTransferNumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
                list.Add(new WarehouseTransferNumberSuffix_DTO
                {
                    WHTS_Number = L(dr, "WHTS_Number"),
                    WHTS_Date = S(dr, "WHTS_Date"),
                    WHTS_EndDate = S(dr, "WHTS_EndDate"),
                    WHTS_Particulars = S(dr, "WHTS_Particulars"),
                    WHTS_IsDeleted = false
                });
            return list;
        }

        // ---------- summary register (WHT_Summary_SP) ----------
        public List<WarehouseTransferSummary_DTO> SummaryList(DataSet ds)
        {
            var list = new List<WarehouseTransferSummary_DTO>();
            if (ds == null || ds.Tables.Count < 1) return list;

            foreach (DataRow dr in ds.Tables[0].Rows)
                list.Add(new WarehouseTransferSummary_DTO
                {
                    WHTH_JournalNo = S(dr, "WHTH_JournalNo"),
                    WHTH_Number = L(dr, "WHTH_Number"),
                    WHTH_Date = Dt(dr, "WHTH_Date"),
                    Segregation = S(dr, "Segregation"),
                    NoOfLines = IN(dr, "NoOfLines"),
                    TotalQty = DN(dr, "TotalQty")
                });
            return list;
        }

        // ---------- detailed register (WHT_Detailed_SP) ----------
        public List<WarehouseTransferDetailed_DTO> DetailedList(DataSet ds)
        {
            var list = new List<WarehouseTransferDetailed_DTO>();
            if (ds == null || ds.Tables.Count < 1) return list;

            foreach (DataRow dr in ds.Tables[0].Rows)
                list.Add(new WarehouseTransferDetailed_DTO
                {
                    WHTH_JournalNo = S(dr, "WHTH_JournalNo"),
                    WHTH_Number = LN(dr, "WHTH_Number"),
                    WHTH_Date = Dt(dr, "WHTH_Date"),
                    Segregation = S(dr, "Segregation"),
                    WHTI_Number = LN(dr, "WHTI_Number"),
                    ItemCode = S(dr, "ItemCode"),
                    ItemDescription = S(dr, "ItemDescription"),
                    OuterDia = S(dr, "OuterDia"),
                    Thickness = S(dr, "Thickness"),
                    Length = S(dr, "Length"),
                    MaterialGrade = S(dr, "MaterialGrade"),
                    ItemGroup = S(dr, "ItemGroup"),
                    FromWHCode = S(dr, "FromWHCode"),
                    ToWHCode = S(dr, "ToWHCode"),
                    UOMCode = S(dr, "UOMCode"),
                    WHTI_Qty = DN(dr, "WHTI_Qty")
                });
            return list;
        }
    }
}