using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;

namespace ERP_DL
{
    public class JW_Vendor_DL
    {
        // ---------- helpers ----------
        static string S(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? "" : Convert.ToString(dr[col]) ?? "";
        }
        static Int64 L(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? 0 : Convert.ToInt64(dr[col]);
        }
        static Int16 I16(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? (Int16)0 : Convert.ToInt16(dr[col]);
        }
        // SP returns "05 Oct 2026" (style 106) but flatpickr needs "05-Oct-2026"
        static string D(DataRow dr, string col)
        {
            if (dr[col] == DBNull.Value) return "";
            if (DateTime.TryParse(Convert.ToString(dr[col]), CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime d))
                return d.ToString("dd-MMM-yyyy", CultureInfo.InvariantCulture);
            return Convert.ToString(dr[col]) ?? "";
        }

        // ---------- Id 21 : Table[0] list ----------
        public List<JW_VendorList_DTO> JW_VendorList(DataTable Dt)
        {
            List<JW_VendorList_DTO> List = new List<JW_VendorList_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                List.Add(new JW_VendorList_DTO
                {
                    JWV_Number = L(dr, "JWV_Number"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    JWV_Currency_Name = S(dr, "JWV_Currency_Name"),
                    JWV_JVG_Name = S(dr, "JWV_JVG_Name"),
                    JWV_JVC_Name = S(dr, "JWV_JVC_Name")
                });
            }
            return List;
        }

        // ---------- Id 11 : Table[0] head ----------
        public List<JW_VendorHead_DTO> JW_VendorHeadList(DataTable Dt)
        {
            List<JW_VendorHead_DTO> List = new List<JW_VendorHead_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                List.Add(new JW_VendorHead_DTO
                {
                    JWV_Number = L(dr, "JWV_Number"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    JWV_JVG_Number = L(dr, "JWV_JVG_Number"),
                    JWV_JVC_Number = L(dr, "JWV_JVC_Number"),
                    JWV_WH_Number = L(dr, "JWV_WH_Number"),
                    JWV_PaymentTerms = S(dr, "JWV_PaymentTerms"),
                    JWV_PaymentMode = S(dr, "JWV_PaymentMode"),
                    JWV_CreditDays = dr["JWV_CreditDays"] == DBNull.Value ? 0 : Convert.ToInt32(dr["JWV_CreditDays"]),
                    JWV_Currency_Number = L(dr, "JWV_Currency_Number"),
                    JWV_AccountName = S(dr, "JWV_AccountName"),
                    JWV_AccountNumber = S(dr, "JWV_AccountNumber"),
                    JWV_IFSC = S(dr, "JWV_IFSC"),
                    JWV_BankName = S(dr, "JWV_BankName"),
                    JWV_RT_Number = L(dr, "JWV_RT_Number"),
                    JWV_GSTIN = S(dr, "JWV_GSTIN"),
                    JWV_AT_Number = L(dr, "JWV_AT_Number"),
                    JWV_TransportAgency = I16(dr, "JWV_TransportAgency"),
                    JWV_TransporterID = S(dr, "JWV_TransporterID"),
                    JWV_PAN = S(dr, "JWV_PAN"),
                    JWV_WithholdTax = I16(dr, "JWV_WithholdTax"),
                    JWV_AN_Number = L(dr, "JWV_AN_Number")
                });
            }
            return List;
        }

        // ---------- Id 11 : Table[1] address ----------
        public List<JW_VendorAdd_DTO> JW_VendorAddList(DataTable Dt)
        {
            List<JW_VendorAdd_DTO> List = new List<JW_VendorAdd_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                List.Add(new JW_VendorAdd_DTO
                {
                    JWV_ADD_Number = L(dr, "JWV_ADD_Number"),
                    JWV_ADD_ADTP_Number = L(dr, "JWV_ADD_ADTP_Number"),
                    JWV_ADD_Address_ID = S(dr, "JWV_ADD_Address_ID"),
                    JWV_ADD_Address = S(dr, "JWV_ADD_Address"),
                    JWV_ADD_City = S(dr, "JWV_ADD_City"),
                    JWV_ADD_State = S(dr, "JWV_ADD_State"),
                    JWV_ADD_Country = S(dr, "JWV_ADD_Country"),
                    JWV_ADD_PIN = S(dr, "JWV_ADD_PIN"),
                    JWV_ADD_GSTIN = S(dr, "JWV_ADD_GSTIN"),
                    JWV_ADD_Default = I16(dr, "JWV_ADD_Default") == 1,
                    JWV_ADD_IsDeleted = 0
                });
            }
            return List;
        }

        // ---------- Id 11 : Table[2] contact ----------
        public List<JW_VendorContact_DTO> JW_VendorContactList(DataTable Dt)
        {
            List<JW_VendorContact_DTO> List = new List<JW_VendorContact_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                List.Add(new JW_VendorContact_DTO
                {
                    JWV_CNT_Number = L(dr, "JWV_CNT_Number"),
                    JWV_CNT_ContactName = S(dr, "JWV_CNT_ContactName"),
                    JWV_CNT_Department = S(dr, "JWV_CNT_Department"),
                    JWV_CNT_Mobile = S(dr, "JWV_CNT_Mobile"),
                    JWV_CNT_Telephone = S(dr, "JWV_CNT_Telephone"),
                    JWV_CNT_Email = S(dr, "JWV_CNT_Email"),
                    JWV_CNT_IsDeleted = 0
                });
            }
            return List;
        }

        // ---------- Id 11 : Table[3] WHT ----------
        public List<JW_VendorWHT_DTO> JW_VendorWHTList(DataTable Dt)
        {
            List<JW_VendorWHT_DTO> List = new List<JW_VendorWHT_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                List.Add(new JW_VendorWHT_DTO
                {
                    JWV_WHT_Number = L(dr, "JWV_WHT_Number"),
                    JWV_WHT_WHTC_Number = S(dr, "JWV_WHT_WHTC_Number"),
                    JWV_WHT_WHTT_Number = S(dr, "JWV_WHT_WHTT_Number"),
                    JWV_WHT_WHT_Number = S(dr, "JWV_WHT_WHT_Number"),
                    JWV_WHT_WHT_Description = S(dr, "JWV_WHT_Description"),
                    JWV_WHT_FromDate = D(dr, "JWV_WHT_FromDate"),
                    JWV_WHT_ToDate = D(dr, "JWV_WHT_ToDate"),
                    JWV_WHT_IsDeleted = 0
                });
            }
            return List;
        }

        // ---------- Id 11 : Table[4] GST ----------
        public List<JW_VendorGST_DTO> JW_VendorGSTList(DataTable Dt)
        {
            List<JW_VendorGST_DTO> List = new List<JW_VendorGST_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                List.Add(new JW_VendorGST_DTO
                {
                    JWV_GST_Number = L(dr, "JWV_GST_Number"),
                    JWV_GST_GSTC_Number = S(dr, "JWV_GST_GSTC_Number"),
                    JWV_GST_GSTT_Number = S(dr, "JWV_GST_GSTT_Number"),
                    JWV_GST_TCT_Number = S(dr, "JWV_GST_TCT_Number"),
                    JWV_GST_TCT_Description = S(dr, "JWV_GST_Description"),
                    JWV_GST_FromDate = D(dr, "JWV_GST_FromDate"),
                    JWV_GST_ToDate = D(dr, "JWV_GST_ToDate"),
                    JWV_GST_IsDeleted = 0
                });
            }
            return List;
        }

        // ---------- Id 26 : WHT tax code AJAX ----------
        public List<JW_Vendor_DTO> JW_VendorWHTGridTaxCode(DataTable Dt)
        {
            List<JW_Vendor_DTO> List = new List<JW_Vendor_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                List.Add(new JW_Vendor_DTO
                {
                    WH_Number = S(dr, "WH_Number"),
                    WH_TaxCode = S(dr, "WH_TaxCode"),
                    WH_TaxDescription = S(dr, "WH_TaxDescription")
                });
            }
            return List;
        }

        // ---------- Id 27 : GST tax cluster AJAX ----------
        public List<JW_Vendor_DTO> JW_VendorGSTGridTaxCluster(DataTable Dt)
        {
            List<JW_Vendor_DTO> List = new List<JW_Vendor_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                List.Add(new JW_Vendor_DTO
                {
                    TCT_Number = S(dr, "TaxClusterNumber"),
                    TCT_Name = S(dr, "TaxCluster"),
                    TCT_Description = S(dr, "ClusterDescription")
                });
            }
            return List;
        }
    }
}
