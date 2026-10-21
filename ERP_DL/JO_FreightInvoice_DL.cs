using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;

namespace ERP_DL
{
    public class JO_FreightInvoice_DL
    {
        // ---------- helpers ----------
        private static string S(DataRow dr, string col)
        {
            return dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value
                ? Convert.ToString(dr[col]) : "";
        }

        private static string D(DataRow dr, string col)
        {
            if (!dr.Table.Columns.Contains(col) || dr[col] == DBNull.Value) return "";
            return dr[col] is DateTime dt ? dt.ToString("dd-MMM-yyyy") : Convert.ToString(dr[col]);
        }

        private static decimal M(DataRow dr, string col)
        {
            return dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value
                ? Convert.ToDecimal(dr[col]) : 0m;
        }

        private static long L(DataRow dr, string col)
        {
            return dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value
                ? Convert.ToInt64(dr[col]) : 0;
        }

        private static double F(DataRow dr, string col)
        {
            return dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value
                ? Convert.ToDouble(dr[col]) : 0;
        }

        // ---------- Summary ----------
        public List<JO_FreightInvoiceSummary_DTO> FreightInvoiceSummaryList(DataTable Dt)
        {
            var list = new List<JO_FreightInvoiceSummary_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JO_FreightInvoiceSummary_DTO
                {
                    JOFTIH_Number = L(dr, "JOFTIH_Number"),
                    JOFTIH_JournalNo = S(dr, "JOFTIH_JournalNo"),
                    JOFTIH_JournalDate = D(dr, "JOFTIH_JournalDate"),
                    JOFTIH_VendorInvoiceNo = S(dr, "JOFTIH_VendorInvoiceNo"),
                    JOFTIH_VendorInvoiceDate = D(dr, "JOFTIH_VendorInvoiceDate"),
                    JOFTIH_Category = S(dr, "JOFTIH_Category"),
                    JOFTIH_RCM = S(dr, "JOFTIH_RCM"),
                    DN_List = S(dr, "DN_List"),
                    DN_Count = S(dr, "DN_Count"),
                    SO_List = S(dr, "SO_List"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    VendorGroup = S(dr, "VendorGroup"),
                    VendorCategory = S(dr, "VendorCategory"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    TaxCluster = S(dr, "TaxCluster"),
                    WarehouseCode = S(dr, "WarehouseCode"),
                    WH_TaxCode = S(dr, "WH_TaxCode"),
                    NoOfLineItems = (int)L(dr, "NoOfLineItems"),
                    TotalQty = M(dr, "TotalQty"),
                    Amount = M(dr, "Amount"),
                    GST_Amount = M(dr, "GST_Amount"),
                    WHT_Amount = M(dr, "WHT_Amount"),
                    TotalQtyKgs = M(dr, "TotalQtyKgs")
                });
            }
            return list;
        }

        public JO_FreightInvoiceSummaryTotal_DTO FreightInvoiceSummaryTotal(DataTable Dt)
        {
            var t = new JO_FreightInvoiceSummaryTotal_DTO();
            if (Dt != null && Dt.Rows.Count > 0)
            {
                DataRow dr = Dt.Rows[0];
                t.GrandTotalQty = M(dr, "GrandTotalQty");
                t.GrandTotalQtyKgs = M(dr, "GrandTotalQtyKgs");
                t.GrandTotalAmount = M(dr, "GrandTotalAmount");
                t.GrandTotalGST = M(dr, "GrandTotalGST");
                t.GrandTotalWHT = M(dr, "GrandTotalWHT");
            }
            return t;
        }

        // ---------- Detailed ----------
        public List<JO_FreightInvoiceDetail_DTO> FreightInvoiceDetailList(DataTable Dt)
        {
            var list = new List<JO_FreightInvoiceDetail_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JO_FreightInvoiceDetail_DTO
                {
                    JOFTIH_Number = L(dr, "JOFTIH_Number"),
                    JOFTIH_JournalNo = S(dr, "JOFTIH_JournalNo"),
                    JOFTIH_JournalDate = D(dr, "JOFTIH_JournalDate"),
                    JOFTIH_VendorInvoiceNo = S(dr, "JOFTIH_VendorInvoiceNo"),
                    JOFTIH_VendorInvoiceDate = D(dr, "JOFTIH_VendorInvoiceDate"),
                    JOFTIH_Category = S(dr, "JOFTIH_Category"),
                    SourceNo = S(dr, "SourceNo"),
                    SourceDate = D(dr, "SourceDate"),
                    Vendor_DN_No = S(dr, "Vendor_DN_No"),
                    Vendor_DN_Date = D(dr, "Vendor_DN_Date"),
                    ServiceOrderNo = S(dr, "ServiceOrderNo"),
                    ServiceOrderDate = D(dr, "ServiceOrderDate"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    VendorGroup = S(dr, "VendorGroup"),
                    VendorCategory = S(dr, "VendorCategory"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    TaxCluster = S(dr, "TaxCluster"),
                    WH_TaxCode = S(dr, "WH_TaxCode"),
                    JPRS_ProcessName = S(dr, "JPRS_ProcessName"),
                    ItemGroup = S(dr, "ItemGroup"),
                    ItemCode = S(dr, "ItemCode"),
                    ItemDescription = S(dr, "ItemDescription"),
                    OuterDia = S(dr, "OuterDia"),
                    Thickness = S(dr, "Thickness"),
                    Length = S(dr, "Length"),
                    ITM_Width = S(dr, "ITM_Width"),
                    MaterialGrade = S(dr, "MaterialGrade"),
                    UOM = S(dr, "UOM"),
                    FromWH = S(dr, "FromWH"),
                    ToWH = S(dr, "ToWH"),
                    JOFTII_Number = L(dr, "JOFTII_Number"),
                    JOFTII_Qty = M(dr, "JOFTII_Qty"),
                    JOFTII_Qty_Kgs = M(dr, "JOFTII_Qty_Kgs"),
                    JOFTII_Rate = M(dr, "JOFTII_Rate"),
                    JOFTII_Amount = M(dr, "JOFTII_Amount"),
                    JOFTII_GST_Amount = M(dr, "JOFTII_GST_Amount"),
                    JOFTII_WHT_Percent = M(dr, "JOFTII_WHT_Percent"),
                    JOFTII_WH_TaxAmount = M(dr, "JOFTII_WH_TaxAmount"),
                    JOFTII_RCM = S(dr, "JOFTII_RCM")
                });
            }
            return list;
        }

        public JO_FreightInvoiceDetailTotal_DTO FreightInvoiceDetailTotal(DataTable Dt)
        {
            var t = new JO_FreightInvoiceDetailTotal_DTO();
            if (Dt != null && Dt.Rows.Count > 0)
            {
                DataRow dr = Dt.Rows[0];
                t.TotalQty = M(dr, "TotalQty");
                t.TotalQtyKgs = M(dr, "TotalQtyKgs");
                t.TotalAmount = M(dr, "TotalAmount");
                t.TotalGST = M(dr, "TotalGST");
                t.TotalWHT = M(dr, "TotalWHT");
            }
            return t;
        }

        // ---------- Source popup (DN / RN) ----------
        public List<JO_FreightInvoiceSourceGroup_DTO> SourceGroupList(DataTable Dt)
        {
            var list = new List<JO_FreightInvoiceSourceGroup_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JO_FreightInvoiceSourceGroup_DTO
                {
                    JOMNH_Number = L(dr, "JOMNH_Number"),
                    JOMNH_No = S(dr, "JOMNH_No"),
                    JOMNH_Date = dr["JOMNH_Date"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dr["JOMNH_Date"]),
                    TotalQty = F(dr, "TotalQty"),
                    TotalInvoicedQty = F(dr, "TotalInvoicedQty"),
                    RemainingQty = F(dr, "RemainingQty")
                });
            }
            return list;
        }

        public List<JO_FreightInvoiceSourceItem_DTO> SourceItemList(DataTable Dt)
        {
            var list = new List<JO_FreightInvoiceSourceItem_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JO_FreightInvoiceSourceItem_DTO
                {
                    JOMNH_Number = L(dr, "JOMNH_Number"),
                    JOMNH_No = S(dr, "JOMNH_No"),
                    JOMNH_Date = dr["JOMNH_Date"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dr["JOMNH_Date"]),
                    JOMNH_Vendor_Number = L(dr, "JOMNH_Vendor_Number"),
                    JOMNH_Currency_Number = L(dr, "JOMNH_Currency_Number"),
                    JOMNH_WH_Number = L(dr, "JOMNH_WH_Number"),
                    JOMNH_Remarks = S(dr, "JOMNH_Remarks"),
                    JOMNI_Number = L(dr, "JOMNI_Number"),
                    JPRS_Number = L(dr, "JPRS_Number"),
                    ProcessName = S(dr, "ProcessName"),
                    Item_Number = L(dr, "Item_Number"),
                    UoM_Number = L(dr, "UoM_Number"),
                    DeliveredQty = F(dr, "DeliveredQty"),
                    InvoicedQty = F(dr, "InvoicedQty"),
                    RemainingQty = F(dr, "RemainingQty"),
                    UnitPrice = F(dr, "UnitPrice"),
                    FromWH_Number = dr["FromWH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(dr["FromWH_Number"]),
                    ToWH_Number = dr["ToWH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(dr["ToWH_Number"]),
                    JOFRT_SVOH_Number = L(dr, "JOFRT_SVOH_Number"),
                    JOFRT_SVOI_Number = L(dr, "JOFRT_SVOI_Number"),
                    ServiceOrderNo = S(dr, "ServiceOrderNo"),
                    SO_Rate = F(dr, "SO_Rate"),
                    hasServiceOrder = (int)L(dr, "hasServiceOrder"),
                    ItemGroup = S(dr, "ItemGroup"),
                    ItemCode = S(dr, "ItemCode"),
                    ItemDescription = S(dr, "ItemDescription"),
                    OuterDia = S(dr, "OuterDia"),
                    Thickness = S(dr, "Thickness"),
                    Length = S(dr, "Length"),
                    ITM_Width = S(dr, "ITM_Width"),
                    MaterialGrade = S(dr, "MaterialGrade"),
                    UOM = S(dr, "UOM"),
                    SAC_Number = L(dr, "SAC_Number"),
                    SAC = S(dr, "SAC")
                });
            }
            return list;
        }

        // ---------- Freight Service Order ----------
        public List<JO_FreightServiceOrderDropdown_DTO> ServiceOrderDropdownList(DataTable Dt)
        {
            var list = new List<JO_FreightServiceOrderDropdown_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JO_FreightServiceOrderDropdown_DTO
                {
                    JOFRT_SVOH_Number = L(dr, "JOFRT_SVOH_Number"),
                    ServiceOrderNo = S(dr, "ServiceOrderNo"),
                    JOFRT_SVOI_Number = L(dr, "JOFRT_SVOI_Number")
                });
            }
            return list;
        }
    }
}