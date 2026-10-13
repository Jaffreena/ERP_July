using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;

namespace ERP_DL
{
    public class JO_JobworkInvoice_DL
    {
        #region safe readers (null / missing column safe)
        private static bool Has(DataRow dr, string col)
        {
            return dr.Table.Columns.Contains(col) && dr[col] != DBNull.Value;
        }
        private static string S(DataRow dr, string col)
        {
            return Has(dr, col) ? Convert.ToString(dr[col]) : null;
        }
        private static long L(DataRow dr, string col)
        {
            return Has(dr, col) ? Convert.ToInt64(dr[col]) : 0;
        }
        private static int I(DataRow dr, string col)
        {
            return Has(dr, col) ? Convert.ToInt32(dr[col]) : 0;
        }
        private static double D(DataRow dr, string col)
        {
            return Has(dr, col) ? Convert.ToDouble(dr[col]) : 0;
        }
        private static DateTime DT(DataRow dr, string col)
        {
            return Has(dr, col) ? Convert.ToDateTime(dr[col]) : DateTime.MinValue;
        }
        private static DateTime? DTN(DataRow dr, string col)
        {
            return Has(dr, col) ? Convert.ToDateTime(dr[col]) : (DateTime?)null;
        }
        #endregion

        #region Vendor / Cluster / WHT lookup
        public List<JO_JobworkInvoiceVendor_DTO> VendorList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceVendor_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceVendor_DTO
                {
                    JWV_Number = L(dr, "JWV_Number"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    JWV_Currency_Number = L(dr, "JWV_Currency_Number"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    DecimalPlaces = I(dr, "DecimalPlaces"),
                    JWV_WH_Number = L(dr, "JWV_WH_Number"),
                    JWV_CreditDays = I(dr, "JWV_CreditDays"),
                    JWV_PaymentTerms = S(dr, "JWV_PaymentTerms"),
                    JWV_PaymentMode = S(dr, "JWV_PaymentMode"),
                    JWV_WithholdTax = I(dr, "JWV_WithholdTax"),
                    TaxClusterNumber = L(dr, "TaxClusterNumber"),
                    TaxCluster = S(dr, "TaxCluster"),
                    TaxCode = L(dr, "TaxCode")
                });
            }
            return list;
        }

        public List<JO_JobworkInvoiceTaxCluster_DTO> TaxClusterList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceTaxCluster_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceTaxCluster_DTO
                {
                    TaxClusterNumber = L(dr, "TaxClusterNumber"),
                    TaxCluster = S(dr, "TaxCluster")
                });
            }
            return list;
        }

        public List<JO_JobworkInvoiceWHT_DTO> WHTList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceWHT_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceWHT_DTO
                {
                    IncludeTax = I(dr, "IncludeTax"),
                    TaxNumber = L(dr, "TaxNumber"),
                    TaxCode = S(dr, "TaxCode"),
                    TaxPercentage = D(dr, "TaxPercentage")
                });
            }
            return list;
        }
        #endregion

        #region Receipt Note popup
        public List<JO_JobworkInvoiceRN_DTO> ReceiptNoteGroupList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceRN_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceRN_DTO
                {
                    JORNH_Number = L(dr, "JORNH_Number"),
                    JORNH_MS_Number = L(dr, "JORNH_MS_Number"),
                    JORNH_RN_No = S(dr, "JORNH_RN_No"),
                    JORNH_RN_Date = DT(dr, "JORNH_RN_Date"),
                    JORNH_VendorDC_No = S(dr, "JORNH_VendorDC_No"),
                    JORNH_VendorDC_Date = DTN(dr, "JORNH_VendorDC_Date"),
                    TotalQty = D(dr, "TotalQty"),
                    TotalInvoicedQty = D(dr, "TotalInvoicedQty"),
                    RemainingQty = D(dr, "RemainingQty")
                });
            }
            return list;
        }

        public List<JO_JobworkInvoiceRNItem_DTO> ReceiptNoteItemList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceRNItem_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceRNItem_DTO
                {
                    JORNH_Number = L(dr, "JORNH_Number"),
                    JORNH_RN_No = S(dr, "JORNH_RN_No"),
                    JORNH_RN_Date = DT(dr, "JORNH_RN_Date"),
                    JORNH_VendorDC_No = S(dr, "JORNH_VendorDC_No"),
                    JORNH_VendorDC_Date = DTN(dr, "JORNH_VendorDC_Date"),
                    JORNH_MS_Number = L(dr, "JORNH_MS_Number"),
                    JORNH_JW_Vendor_Number = L(dr, "JORNH_JW_Vendor_Number"),
                    JORNH_Currency_Number = L(dr, "JORNH_Currency_Number"),
                    JORNH_WH_Number = L(dr, "JORNH_WH_Number"),

                    JORNI_Number = L(dr, "JORNI_Number"),
                    JORNI_JPRS_Number = L(dr, "JORNI_JPRS_Number"),
                    JPRS_ProcessName = S(dr, "JPRS_ProcessName"),
                    JORNI_Item_Number = L(dr, "JORNI_Item_Number"),
                    JORNI_UoM_Number = L(dr, "JORNI_UoM_Number"),
                    ReceivedQty = D(dr, "ReceivedQty"),
                    InvoicedQty = D(dr, "InvoicedQty"),
                    RemainingQty = D(dr, "RemainingQty"),
                    JORNI_UnitPrice = D(dr, "JORNI_UnitPrice"),
                    JORNI_JOJWI_SVOH_Number = L(dr, "JORNI_JOJWI_SVOH_Number"),
                    JORNI_JOJWI_SVOI_Number = L(dr, "JORNI_JOJWI_SVOI_Number"),
                    ServiceOrderNo = S(dr, "ServiceOrderNo"),

                    ItemCode = S(dr, "ItemCode"),
                    ItemDescription = S(dr, "ItemDescription"),
                    OuterDia = S(dr, "OuterDia"),
                    Thickness = S(dr, "Thickness"),
                    Length = S(dr, "Length"),
                    MaterialGrade = S(dr, "MaterialGrade"),
                    ItemGroup = S(dr, "ItemGroup"),
                    UOM = S(dr, "UOM"),
                    SAC_Number = Has(dr, "SAC_Number") ? Convert.ToInt64(dr["SAC_Number"]) : (long?)null,
                    SAC = S(dr, "SAC")
                });
            }
            return list;
        }
        #endregion

        #region Edit / View  (Get SP : 0 Header, 1 Items, 2 Address, 3 GST)
        public JO_JobworkInvoiceHead_DTO HeaderRow(DataTable dt)
        {
            if (dt == null || dt.Rows.Count == 0) return new JO_JobworkInvoiceHead_DTO();
            DataRow dr = dt.Rows[0];
            return new JO_JobworkInvoiceHead_DTO
            {
                JOSVIH_Number = L(dr, "JOSVIH_Number"),
                JOSVIH_JournalNo = S(dr, "JOSVIH_JournalNo"),
                JOSVIH_JournalDate = DT(dr, "JOSVIH_JournalDate"),
                JOSVIH_VendorInvoiceNo = S(dr, "JOSVIH_VendorInvoiceNo"),
                JOSVIH_VendorInvoiceDate = DT(dr, "JOSVIH_VendorInvoiceDate"),
                JOSVIH_MS_Number = L(dr, "JOSVIH_MS_Number"),
                JOSVIH_JW_Vendor_Number = L(dr, "JOSVIH_JW_Vendor_Number"),
                JOSVIH_JW_Vendor_Name = S(dr, "JWV_JW_VendorName"),
                JOSVIH_Currency_Number = L(dr, "JOSVIH_Currency_Number"),
                JOSVIH_TCT_Number = L(dr, "JOSVIH_TCT_Number"),
                JOSVIH_WHT_Number = L(dr, "JOSVIH_WHT_Number"),
                JOSVIH_PaymentTerms = S(dr, "JOSVIH_PaymentTerms"),
                JOSVIH_PaymentMethod = S(dr, "JOSVIH_PaymentMethod"),
                JOSVIH_Remarks = S(dr, "JOSVIH_Remarks")
            };
        }

        public List<JO_JobworkInvoiceItem_DTO> ItemList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceItem_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                double delivered = D(dr, "DeliveredQty");
                double prev = D(dr, "PrevInvoicedQty");

                list.Add(new JO_JobworkInvoiceItem_DTO
                {
                    JOSVII_JOSVIH_Number = L(dr, "JOSVII_JOSVIH_Number"),
                    JOSVII_Number = L(dr, "JOSVII_Number"),
                    JOSVII_JORNH_Number = L(dr, "JOSVII_JORNH_Number"),
                    JOSVII_JORNI_Number = L(dr, "JOSVII_JORNI_Number"),
                    JOSVII_JOJWI_SVOH_Number = L(dr, "JOSVII_JOJWI_SVOH_Number"),
                    JOSVII_JOJWI_SVOI_Number = L(dr, "JOSVII_JOJWI_SVOI_Number"),
                    JOSVII_Vendor_DN_No = S(dr, "JOSVII_Vendor_DN_No"),
                    JOSVII_JPRS_Number = L(dr, "JOSVII_JPRS_Number"),
                    JOSVII_Item_Number = L(dr, "JOSVII_Item_Number"),
                    JOSVII_UoM_Number = L(dr, "JOSVII_UoM_Number"),
                    JOSVII_Qty = D(dr, "JOSVII_Qty"),
                    JOSVII_UnitPrice = D(dr, "JOSVII_UnitPrice"),
                    JOSVII_Amount = D(dr, "JOSVII_Amount"),
                    JOSVII_SAC_Number = L(dr, "JOSVII_SAC_Number"),
                    JOSVII_GST_Amount = D(dr, "JOSVII_GST_Amount"),
                    JOSVII_WHT_Percent = D(dr, "JOSVII_WHT_Percent"),
                    JOSVII_WH_TaxAmount = D(dr, "JOSVII_WH_TaxAmount"),

                    JORNH_RN_No = S(dr, "JORNH_RN_No"),
                    JORNH_RN_Date = DTN(dr, "JORNH_RN_Date"),
                    ServiceOrderNo = S(dr, "ServiceOrderNo"),
                    JPRS_ProcessName = S(dr, "JPRS_ProcessName"),
                    ItemCode = S(dr, "ItemCode"),
                    ItemDescription = S(dr, "ItemDescription"),
                    OuterDia = S(dr, "OuterDia"),
                    Thickness = S(dr, "Thickness"),
                    Length = S(dr, "Length"),
                    MaterialGrade = S(dr, "MaterialGrade"),
                    ItemGroup = S(dr, "ItemGroup"),
                    UOM = S(dr, "UOM"),
                    SAC_Code = S(dr, "SAC_Code"),
                    DeliveredQty = delivered,
                    PrevInvoicedQty = prev,
                    RemainingQty = delivered - prev      // max Qty allowed for this invoice row
                });
            }
            return list;
        }

        public List<JO_JobworkInvoiceAddress_DTO> AddressList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceAddress_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceAddress_DTO
                {
                    JOSVIA_JOSVIH_Number = L(dr, "JOSVIA_JOSVIH_Number"),
                    JOSVIA_Number = L(dr, "JOSVIA_Number"),
                    JOSVIA_ADTP_Number = L(dr, "JOSVIA_ADTP_Number"),
                    JOSVIA_Address_ID = S(dr, "JOSVIA_Address_ID"),
                    JOSVIA_Address = S(dr, "JOSVIA_Address"),
                    JOSVIA_City = S(dr, "JOSVIA_City"),
                    JOSVIA_State = S(dr, "JOSVIA_State"),
                    JOSVIA_Country = S(dr, "JOSVIA_Country"),
                    JOSVIA_PIN = S(dr, "JOSVIA_PIN"),
                    JOSVIA_GSTIN = S(dr, "JOSVIA_GSTIN")
                });
            }
            return list;
        }

        public List<JO_JobworkInvoiceGST_DTO> GstList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceGST_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceGST_DTO
                {
                    JOSVIG_JOSVIH_Number = L(dr, "JOSVIG_JOSVIH_Number"),
                    JOSVIG_JOSVII_Number = L(dr, "JOSVIG_JOSVII_Number"),
                    JOSVIG_Number = L(dr, "JOSVIG_Number"),
                    JOSVIG_Index = I(dr, "JOSVIG_Index"),
                    JOSVIG_GSTC_Number = L(dr, "JOSVIG_GSTC_Number"),
                    JOSVIG_GSTT_Number = L(dr, "JOSVIG_GSTT_Number"),
                    JOSVIG_GSTE_Number = L(dr, "JOSVIG_GSTE_Number"),
                    JOSVIG_AssessableValue = D(dr, "JOSVIG_AssessableValue"),
                    JOSVIG_Percent = D(dr, "JOSVIG_Percent"),
                    JOSVIG_GST_Amount = D(dr, "JOSVIG_GST_Amount")
                });
            }
            return list;
        }

        // whole Edit/View model in one call
        public JO_JobworkInvoiceCreate_DTO InvoiceModel(DataSet ds)
        {
            var model = new JO_JobworkInvoiceCreate_DTO();
            if (ds == null || ds.Tables.Count == 0) return model;

            model.Header = HeaderRow(ds.Tables[0]);
            if (ds.Tables.Count > 1) model.Items = ItemList(ds.Tables[1]);
            if (ds.Tables.Count > 2) model.Addresses = AddressList(ds.Tables[2]);
            if (ds.Tables.Count > 3) model.GST = GstList(ds.Tables[3]);
            return model;
        }
        #endregion

        #region Summary
        public List<JO_JobworkInvoiceSummary_DTO> SummaryList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceSummary_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceSummary_DTO
                {
                    JOSVIH_Number = L(dr, "JOSVIH_Number"),
                    JOSVIH_JournalNo = S(dr, "JOSVIH_JournalNo"),
                    JOSVIH_JournalDate = DT(dr, "JOSVIH_JournalDate"),
                    JOSVIH_VendorInvoiceNo = S(dr, "JOSVIH_VendorInvoiceNo"),
                    JOSVIH_VendorInvoiceDate = DT(dr, "JOSVIH_VendorInvoiceDate"),
                    RN_List = S(dr, "RN_List"),
                    RN_Count = I(dr, "RN_Count"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    VendorGroup = S(dr, "VendorGroup"),
                    VendorCategory = S(dr, "VendorCategory"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    TaxCluster = S(dr, "TaxCluster"),
                    Segregation = S(dr, "Segregation"),
                    WarehouseCode = S(dr, "WarehouseCode"),
                    TotalQty = D(dr, "TotalQty"),
                    Amount = D(dr, "Amount"),
                    GST_Amount = D(dr, "GST_Amount"),
                    WH_TaxAmount = D(dr, "WH_TaxAmount")
                });
            }
            return list;
        }

        public JO_JobworkInvoiceTotals_DTO SummaryTotals(DataTable dt)
        {
            var t = new JO_JobworkInvoiceTotals_DTO();
            if (dt != null && dt.Rows.Count > 0)
            {
                DataRow dr = dt.Rows[0];
                t.GrandTotalQty = D(dr, "GrandTotalQty");
                t.GrandTotalAmount = D(dr, "GrandTotalAmount");
                t.GrandTotalGST = D(dr, "GrandTotalGST");
                t.GrandTotalWHT = D(dr, "GrandTotalWHT");
            }
            return t;
        }
        #endregion

        #region Detailed
        public List<JO_JobworkInvoiceDetailed_DTO> DetailedList(DataTable dt)
        {
            var list = new List<JO_JobworkInvoiceDetailed_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JO_JobworkInvoiceDetailed_DTO
                {
                    JOSVIH_Number = L(dr, "JOSVIH_Number"),
                    JOSVIH_JournalNo = S(dr, "JOSVIH_JournalNo"),
                    JOSVIH_JournalDate = DT(dr, "JOSVIH_JournalDate"),
                    JOSVIH_VendorInvoiceNo = S(dr, "JOSVIH_VendorInvoiceNo"),
                    JOSVIH_VendorInvoiceDate = DT(dr, "JOSVIH_VendorInvoiceDate"),

                    JORNH_Number = Has(dr, "JORNH_Number") ? Convert.ToInt64(dr["JORNH_Number"]) : (long?)null,
                    JORNH_RN_No = S(dr, "JORNH_RN_No"),
                    JORNH_RN_Date = DTN(dr, "JORNH_RN_Date"),
                    JOSVII_Vendor_DN_No = S(dr, "JOSVII_Vendor_DN_No"),

                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    VendorGroup = S(dr, "VendorGroup"),
                    VendorCategory = S(dr, "VendorCategory"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    TaxCluster = S(dr, "TaxCluster"),

                    JOSVII_Number = Has(dr, "JOSVII_Number") ? Convert.ToInt64(dr["JOSVII_Number"]) : (long?)null,
                    JOSVII_JOSVIH_Number = Has(dr, "JOSVII_JOSVIH_Number") ? Convert.ToInt64(dr["JOSVII_JOSVIH_Number"]) : (long?)null,
                    ServiceOrderNo = S(dr, "ServiceOrderNo"),
                    JPRS_ProcessName = S(dr, "JPRS_ProcessName"),
                    ItemGroup = S(dr, "ItemGroup"),
                    ItemCode = S(dr, "ItemCode"),
                    ItemDescription = S(dr, "ItemDescription"),
                    OuterDia = S(dr, "OuterDia"),
                    Thickness = S(dr, "Thickness"),
                    Length = S(dr, "Length"),
                    MaterialGrade = S(dr, "MaterialGrade"),
                    UOM = S(dr, "UOM"),
                    Segregation = S(dr, "Segregation"),
                    WarehouseCode = S(dr, "WarehouseCode"),

                    JOSVII_Qty = D(dr, "JOSVII_Qty"),
                    JOSVII_UnitPrice = D(dr, "JOSVII_UnitPrice"),
                    JOSVII_Amount = D(dr, "JOSVII_Amount"),
                    JOSVII_GST_Amount = D(dr, "JOSVII_GST_Amount"),
                    JOSVII_WHT_Percent = D(dr, "JOSVII_WHT_Percent"),
                    JOSVII_WH_TaxAmount = D(dr, "JOSVII_WH_TaxAmount")
                });
            }
            return list;
        }

        public JO_JobworkInvoiceDetailedTotals_DTO DetailedTotals(DataTable dt)
        {
            var t = new JO_JobworkInvoiceDetailedTotals_DTO();
            if (dt != null && dt.Rows.Count > 0)
            {
                DataRow dr = dt.Rows[0];
                t.TotalQty = D(dr, "TotalQty");
                t.TotalAmount = D(dr, "TotalAmount");
                t.TotalGST = D(dr, "TotalGST");
                t.TotalWHT = D(dr, "TotalWHT");
            }
            return t;
        }
        #endregion
    }
}