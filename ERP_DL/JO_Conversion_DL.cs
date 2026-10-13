using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;

namespace ERP_DL
{
    public class JO_Conversion_DL
    {
        // ---------- small helpers ----------
        private static string Str(DataRow dr, string col)
            => dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value ? Convert.ToString(dr[col]) : null;

        private static long? LngN(DataRow dr, string col)
            => dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value ? Convert.ToInt64(dr[col]) : (long?)null;

        private static int? IntN(DataRow dr, string col)
            => dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value ? Convert.ToInt32(dr[col]) : (int?)null;

        private static decimal? DecN(DataRow dr, string col)
            => dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value ? Convert.ToDecimal(dr[col]) : (decimal?)null;

        private static decimal Dec(DataRow dr, string col)
            => DecN(dr, col) ?? 0m;

        private static string DateStr(DataRow dr, string col)
       => dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value
               ? Convert.ToDateTime(dr[col]).ToString("dd-MMM-yyyy") : string.Empty;

        // ---------- SUMMARY (SP_JOCNV_Summary) ----------
        public List<JOConversionSummary_DTO> JOConversionSummaryList(DataTable Dt)
        {
            var list = new List<JOConversionSummary_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JOConversionSummary_DTO
                {
                    JOCNVH_JournalNo = Str(dr, "JOCNVH_JournalNo"),
                    JOCNVH_Number = LngN(dr, "JOCNVH_Number") ?? 0,
                    JOCNVH_Date = DateStr(dr, "JOCNVH_Date"),
                    Segregation = Str(dr, "Segregation"),
                    SFT_ShiftName = Str(dr, "SFT_ShiftName"),
                    JWWC_JW_WorkCentre = Str(dr, "JWWC_JW_WorkCentre"),
                    JPRS_ProcessName = Str(dr, "JPRS_ProcessName"),

                    Cons_NoOfLines = IntN(dr, "Cons_NoOfLines"),
                    Cons_Qty = DecN(dr, "Cons_Qty"),
                    Cons_Qty_Kgs = DecN(dr, "Cons_Qty_Kgs"),
                    Cons_UOMCode = Str(dr, "Cons_UOMCode"),
                    Cons_WHCode = Str(dr, "Cons_WHCode"),

                    Prod_NoOfLines = IntN(dr, "Prod_NoOfLines"),
                    Prod_Qty = DecN(dr, "Prod_Qty"),
                    Prod_Qty_Kgs = DecN(dr, "Prod_Qty_Kgs"),
                    Prod_UOMCode = Str(dr, "Prod_UOMCode"),
                    Prod_WHCode = Str(dr, "Prod_WHCode"),

                    Scrap_NoOfLines = IntN(dr, "Scrap_NoOfLines"),
                    Scrap_Qty = DecN(dr, "Scrap_Qty"),
                    Scrap_UOMCode = Str(dr, "Scrap_UOMCode"),
                    Scrap_WHCode = Str(dr, "Scrap_WHCode")
                });
            }

            return list;
        }

        // ---------- DETAILED (SP_JOCNV_Detailed) ----------
        // head columns are NULL except on the first line of each journal (RN = 1)
        public List<JOConversionDetailed_DTO> JOConversionDetailedList(DataTable Dt)
        {
            var list = new List<JOConversionDetailed_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JOConversionDetailed_DTO
                {
                    JOCNVH_JournalNo = Str(dr, "JOCNVH_JournalNo"),
                    JOCNVH_Number = LngN(dr, "JOCNVH_Number"),
                    JOCNVH_Date = DateStr(dr, "JOCNVH_Date"),
                    Segregation = Str(dr, "Segregation"),
                    SFT_ShiftName = Str(dr, "SFT_ShiftName"),
                    JWWC_JW_WorkCentre = Str(dr, "JWWC_JW_WorkCentre"),
                    JPRS_ProcessName = Str(dr, "JPRS_ProcessName"),

                    JOCNVC_Number = LngN(dr, "JOCNVC_Number"),
                    Cons_ItemCode = Str(dr, "Cons_ItemCode"),
                    Cons_ItemDescription = Str(dr, "Cons_ItemDescription"),
                    Cons_OuterDia = Str(dr, "Cons_OuterDia"),
                    Cons_Thickness = Str(dr, "Cons_Thickness"),
                    Cons_Length = Str(dr, "Cons_Length"),
                    Cons_MaterialGrade = Str(dr, "Cons_MaterialGrade"),
                    Cons_ItemGroup = Str(dr, "Cons_ItemGroup"),
                    Cons_WHCode = Str(dr, "Cons_WHCode"),
                    Cons_UOMCode = Str(dr, "Cons_UOMCode"),
                    JOCNVC_ConsQty = DecN(dr, "JOCNVC_ConsQty"),
                    JOCNVC_ConsQty_Kgs = DecN(dr, "JOCNVC_ConsQty_Kgs"),

                    JOCNVP_Number = LngN(dr, "JOCNVP_Number"),
                    Prod_ItemCode = Str(dr, "Prod_ItemCode"),
                    Prod_ItemDescription = Str(dr, "Prod_ItemDescription"),
                    Prod_OuterDia = Str(dr, "Prod_OuterDia"),
                    Prod_Thickness = Str(dr, "Prod_Thickness"),
                    Prod_Length = Str(dr, "Prod_Length"),
                    Prod_MaterialGrade = Str(dr, "Prod_MaterialGrade"),
                    Prod_ItemGroup = Str(dr, "Prod_ItemGroup"),
                    Prod_WHCode = Str(dr, "Prod_WHCode"),
                    Prod_UOMCode = Str(dr, "Prod_UOMCode"),
                    JOCNVP_ItemStatus = Str(dr, "JOCNVP_ItemStatus"),
                    JOCNVP_ProdQty = DecN(dr, "JOCNVP_ProdQty"),
                    JOCNVP_ProdQty_Kgs = DecN(dr, "JOCNVP_ProdQty_Kgs"),

                    JOCNVS_Number = LngN(dr, "JOCNVS_Number"),
                    Scrap_ItemCode = Str(dr, "Scrap_ItemCode"),
                    Scrap_ItemDescription = Str(dr, "Scrap_ItemDescription"),
                    Scrap_OuterDia = Str(dr, "Scrap_OuterDia"),
                    Scrap_Thickness = Str(dr, "Scrap_Thickness"),
                    Scrap_Length = Str(dr, "Scrap_Length"),
                    Scrap_MaterialGrade = Str(dr, "Scrap_MaterialGrade"),
                    Scrap_ItemGroup = Str(dr, "Scrap_ItemGroup"),
                    Scrap_WHCode = Str(dr, "Scrap_WHCode"),
                    Scrap_UOMCode = Str(dr, "Scrap_UOMCode"),
                    JOCNVS_ScrapQty = DecN(dr, "JOCNVS_ScrapQty")
                });
            }

            return list;
        }

        // ---------- NUMBERING (JOCNV_Numbering_SP Id 1) ----------
        public List<JOConversionNumberReset_DTO> JOCRList(DataTable Dt)
        {
            var list = new List<JOConversionNumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
                list.Add(new JOConversionNumberReset_DTO
                {
                    JOCR_Number = LngN(dr, "JOCR_Number") ?? 0,
                    JOCR_Date = Str(dr, "JOCR_Date"),
                    JOCR_EndDate = Str(dr, "JOCR_EndDate"),
                    JOCR_StartingNumber = IntN(dr, "JOCR_StartingNumber") ?? 0,
                    JOCR_NumberofDigits = IntN(dr, "JOCR_NumberofDigits") ?? 0,
                    JOCR_PrefilZero = LngN(dr, "JOCR_PrefilZero") ?? 0,
                    JOCR_Frequency = LngN(dr, "JOCR_Frequency") ?? 0,
                    JOCR_IsDeleted = false
                });
            return list;
        }

        public List<JOConversionNumberPrefix_DTO> JOCPList(DataTable Dt)
        {
            var list = new List<JOConversionNumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
                list.Add(new JOConversionNumberPrefix_DTO
                {
                    JOCP_Number = LngN(dr, "JOCP_Number") ?? 0,
                    JOCP_Date = Str(dr, "JOCP_Date"),
                    JOCP_EndDate = Str(dr, "JOCP_EndDate"),
                    JOCP_Particulars = Str(dr, "JOCP_Particulars"),
                    JOCP_IsDeleted = false
                });
            return list;
        }

        public List<JOConversionNumberSuffix_DTO> JOCSList(DataTable Dt)
        {
            var list = new List<JOConversionNumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
                list.Add(new JOConversionNumberSuffix_DTO
                {
                    JOCS_Number = LngN(dr, "JOCS_Number") ?? 0,
                    JOCS_Date = Str(dr, "JOCS_Date"),
                    JOCS_EndDate = Str(dr, "JOCS_EndDate"),
                    JOCS_Particulars = Str(dr, "JOCS_Particulars"),
                    JOCS_IsDeleted = false
                });
            return list;
        }

        // ---------- BATCH POPUP (JO_Conversion_GetBatch_SP) ----------
        public List<JOConversionBatchList_DTO> JOConversionBatchList(DataTable Dt)
        {
            var list = new List<JOConversionBatchList_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JOConversionBatchList_DTO
                {
                    LineBatch_Number = LngN(dr, "LineBatch_Number") ?? 0,
                    FromWarehouse = LngN(dr, "FromWarehouse") ?? 0,
                    BatchDate = dr["BatchDate"] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(dr["BatchDate"]),
                    BatchNo = Str(dr, "BatchNo"),
                    BatchQty = Dec(dr, "BatchQty"),
                    ReservedQty = Dec(dr, "ReservedQty"),
                    DeliveredQty = Dec(dr, "DeliveredQty"),
                    AvailableQty = Dec(dr, "AvailableQty"),
                    BatchUnitPrice = Dec(dr, "BatchUnitPrice"),
                    BatchValue = Dec(dr, "BatchValue"),
                    WarehouseCode = Str(dr, "WarehouseCode")
                });
            }

            return list;
        }
    }
}