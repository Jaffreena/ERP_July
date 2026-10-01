using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class JO_ServiceOrder_DL
    {
        #region helpers
        private static string S(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? "" : Convert.ToString(dr[col]);
        }

        private static long L(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? 0 : Convert.ToInt64(dr[col]);
        }

        private static int I(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? 0 : Convert.ToInt32(dr[col]);
        }

        private static double D(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? 0 : Convert.ToDouble(dr[col]);
        }

        private static DateTime Dt(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(dr[col]);
        }

        private static DateTime? DtN(DataRow dr, string col)
        {
            return dr[col] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(dr[col]);
        }
        #endregion

        #region JOJWI register
        #region numbering lists

        public List<JOJWI_SVO_NumberReset_DTO> JOJWI_SVO_NRSList(DataTable dt)
        {
            var list = new List<JOJWI_SVO_NumberReset_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOJWI_SVO_NumberReset_DTO
                {
                    JOJWI_SVO_NRS_Number = Convert.ToInt64(dr["JOJWI_SVO_NRS_Number"]),
                    JOJWI_SVO_NRS_StartDate = Convert.ToString(dr["JOJWI_SVO_NRS_StartDate"]),
                    JOJWI_SVO_NRS_EndDate = Convert.ToString(dr["JOJWI_SVO_NRS_EndDate"]),
                    JOJWI_SVO_NRS_StartingNumber = Convert.ToString(dr["JOJWI_SVO_NRS_StartingNumber"]),
                    JOJWI_SVO_NRS_NumberofDigits = Convert.ToString(dr["JOJWI_SVO_NRS_NumberofDigits"]),
                    JOJWI_SVO_NRS_PrefilZero = Convert.ToString(dr["JOJWI_SVO_NRS_PrefilZero"]),
                    JOJWI_SVO_NRS_Frequency = Convert.ToString(dr["JOJWI_SVO_NRS_Frequency"])
                });
            }
            return list;
        }

        public List<JOJWI_SVO_NumberPrefix_DTO> JOJWI_SVO_PFXList(DataTable dt)
        {
            var list = new List<JOJWI_SVO_NumberPrefix_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOJWI_SVO_NumberPrefix_DTO
                {
                    JOJWI_SVO_PFX_Number = Convert.ToInt64(dr["JOJWI_SVO_PFX_Number"]),
                    JOJWI_SVO_PFX_StartDate = Convert.ToString(dr["JOJWI_SVO_PFX_StartDate"]),
                    JOJWI_SVO_PFX_EndDate = Convert.ToString(dr["JOJWI_SVO_PFX_EndDate"]),
                    JOJWI_SVO_PFX_Particulars = Convert.ToString(dr["JOJWI_SVO_PFX_Particulars"])
                });
            }
            return list;
        }

        public List<JOJWI_SVO_NumberSuffix_DTO> JOJWI_SVO_SFXList(DataTable dt)
        {
            var list = new List<JOJWI_SVO_NumberSuffix_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOJWI_SVO_NumberSuffix_DTO
                {
                    JOJWI_SVO_SFX_Number = Convert.ToInt64(dr["JOJWI_SVO_SFX_Number"]),
                    JOJWI_SVO_SFX_StartDate = Convert.ToString(dr["JOJWI_SVO_SFX_StartDate"]),
                    JOJWI_SVO_SFX_EndDate = Convert.ToString(dr["JOJWI_SVO_SFX_EndDate"]),
                    JOJWI_SVO_SFX_Particulars = Convert.ToString(dr["JOJWI_SVO_SFX_Particulars"])
                });
            }
            return list;
        }

        public List<JOFRT_SVO_NumberReset_DTO> JOFRT_SVO_NRSList(DataTable dt)
        {
            var list = new List<JOFRT_SVO_NumberReset_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOFRT_SVO_NumberReset_DTO
                {
                    JOFRT_SVO_NRS_Number = Convert.ToInt64(dr["JOFRT_SVO_NRS_Number"]),
                    JOFRT_SVO_NRS_StartDate = Convert.ToString(dr["JOFRT_SVO_NRS_StartDate"]),
                    JOFRT_SVO_NRS_EndDate = Convert.ToString(dr["JOFRT_SVO_NRS_EndDate"]),
                    JOFRT_SVO_NRS_StartingNumber = Convert.ToString(dr["JOFRT_SVO_NRS_StartingNumber"]),
                    JOFRT_SVO_NRS_NumberofDigits = Convert.ToString(dr["JOFRT_SVO_NRS_NumberofDigits"]),
                    JOFRT_SVO_NRS_PrefilZero = Convert.ToString(dr["JOFRT_SVO_NRS_PrefilZero"]),
                    JOFRT_SVO_NRS_Frequency = Convert.ToString(dr["JOFRT_SVO_NRS_Frequency"])
                });
            }
            return list;
        }

        public List<JOFRT_SVO_NumberPrefix_DTO> JOFRT_SVO_PFXList(DataTable dt)
        {
            var list = new List<JOFRT_SVO_NumberPrefix_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOFRT_SVO_NumberPrefix_DTO
                {
                    JOFRT_SVO_PFX_Number = Convert.ToInt64(dr["JOFRT_SVO_PFX_Number"]),
                    JOFRT_SVO_PFX_StartDate = Convert.ToString(dr["JOFRT_SVO_PFX_StartDate"]),
                    JOFRT_SVO_PFX_EndDate = Convert.ToString(dr["JOFRT_SVO_PFX_EndDate"]),
                    JOFRT_SVO_PFX_Particulars = Convert.ToString(dr["JOFRT_SVO_PFX_Particulars"])
                });
            }
            return list;
        }

        public List<JOFRT_SVO_NumberSuffix_DTO> JOFRT_SVO_SFXList(DataTable dt)
        {
            var list = new List<JOFRT_SVO_NumberSuffix_DTO>();
            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOFRT_SVO_NumberSuffix_DTO
                {
                    JOFRT_SVO_SFX_Number = Convert.ToInt64(dr["JOFRT_SVO_SFX_Number"]),
                    JOFRT_SVO_SFX_StartDate = Convert.ToString(dr["JOFRT_SVO_SFX_StartDate"]),
                    JOFRT_SVO_SFX_EndDate = Convert.ToString(dr["JOFRT_SVO_SFX_EndDate"]),
                    JOFRT_SVO_SFX_Particulars = Convert.ToString(dr["JOFRT_SVO_SFX_Particulars"])
                });
            }
            return list;
        }

        #endregion numbering lists

        public List<JOJWI_ServiceOrderSummary_DTO> JOJWI_SummaryList(DataTable dt)
        {
            var list = new List<JOJWI_ServiceOrderSummary_DTO>();

            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOJWI_ServiceOrderSummary_DTO
                {
                    JOJWI_SVOH_Number = L(dr, "JOJWI_SVOH_Number"),
                    JOJWI_SVOH_ServiceOrderNo = S(dr, "JOJWI_SVOH_ServiceOrderNo"),
                    JOJWI_SVOH_ServiceOrderDate = Dt(dr, "JOJWI_SVOH_ServiceOrderDate"),
                    JOJWI_SVOH_JW_Vendor_Number = L(dr, "JOJWI_SVOH_JW_Vendor_Number"),
                    JWV_JVG_Number = L(dr, "JWV_JVG_Number"),
                    JVG_JW_VendorGroup = S(dr, "JVG_JW_VendorGroup"),
                    JVC_JW_VendorCategory = S(dr, "JVC_JW_VendorCategory"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    Process = S(dr, "Process"),
                    NoOfLineItems = I(dr, "NoOfLineItems"),
                    Qty = D(dr, "Qty"),
                    Amount = D(dr, "Amount")
                });
            }

            return list;
        }

        public List<JOJWI_ServiceOrderDetailed_DTO> JOJWI_DetailedList(DataTable dt)
        {
            var list = new List<JOJWI_ServiceOrderDetailed_DTO>();

            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOJWI_ServiceOrderDetailed_DTO
                {
                    JOJWI_SVOH_Number = L(dr, "JOJWI_SVOH_Number"),
                    JOJWI_SVOH_ServiceOrderNo = S(dr, "JOJWI_SVOH_ServiceOrderNo"),
                    JOJWI_SVOH_ServiceOrderDate = Dt(dr, "JOJWI_SVOH_ServiceOrderDate"),
                    JOJWI_SVOH_JW_Vendor_Number = L(dr, "JOJWI_SVOH_JW_Vendor_Number"),
                    JWV_JVG_Number = L(dr, "JWV_JVG_Number"),
                    JVG_JW_VendorGroup = S(dr, "JVG_JW_VendorGroup"),
                    JVC_JW_VendorCategory = S(dr, "JVC_JW_VendorCategory"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    JOJWI_SVOI_JPRS_Number = L(dr, "JOJWI_SVOI_JPRS_Number"),
                    JOJWI_SVOI_Item_Number = L(dr, "JOJWI_SVOI_Item_Number"),
                    JPRS_ProcessName = S(dr, "JPRS_ProcessName"),
                    ItemGroup = S(dr, "ItemGroup"),
                    ItemCode = S(dr, "ItemCode"),
                    ItemDescription = S(dr, "ItemDescription"),
                    OuterDia = S(dr, "OuterDia"),
                    Thickness = S(dr, "Thickness"),
                    ItemLength = S(dr, "ItemLength"),
                    ITM_Width = S(dr, "ITM_Width"),
                    MaterialGrade = S(dr, "MaterialGrade"),
                    WarehouseCode = S(dr, "WarehouseCode"),
                    UOM = S(dr, "UOM"),
                    Qty = D(dr, "JOJWI_SVOI_Qty"),
                    UnitPrice = D(dr, "JOJWI_SVOI_UnitPrice"),
                    Amount = D(dr, "JOJWI_SVOI_Amount"),
                    DeliveryDate = DtN(dr, "JOJWI_SVOI_DeliveryDate")
                });
            }

            return list;
        }
        #endregion

        #region JOFRT register
        public List<JOFRT_ServiceOrderSummary_DTO> JOFRT_SummaryList(DataTable dt)
        {
            var list = new List<JOFRT_ServiceOrderSummary_DTO>();

            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOFRT_ServiceOrderSummary_DTO
                {
                    JOFRT_SVOH_Number = L(dr, "JOFRT_SVOH_Number"),
                    JOFRT_SVOH_ServiceOrderNo = S(dr, "JOFRT_SVOH_ServiceOrderNo"),
                    JOFRT_SVOH_ServiceOrderDate = Dt(dr, "JOFRT_SVOH_ServiceOrderDate"),
                    JOFRT_SVOH_Category = S(dr, "JOFRT_SVOH_Category"),
                    JOFRT_SVOH_JW_Vendor_Number = L(dr, "JOFRT_SVOH_JW_Vendor_Number"),
                    JWV_JVG_Number = L(dr, "JWV_JVG_Number"),
                    JVG_JW_VendorGroup = S(dr, "JVG_JW_VendorGroup"),
                    JVC_JW_VendorCategory = S(dr, "JVC_JW_VendorCategory"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    NoOfLineItems = I(dr, "NoOfLineItems"),
                    Qty = D(dr, "Qty"),
                    Amount = D(dr, "Amount")
                });
            }

            return list;
        }

        public List<JOFRT_ServiceOrderDetailed_DTO> JOFRT_DetailedList(DataTable dt)
        {
            var list = new List<JOFRT_ServiceOrderDetailed_DTO>();

            foreach (DataRow dr in dt.Rows)
            {
                list.Add(new JOFRT_ServiceOrderDetailed_DTO
                {
                    JOFRT_SVOH_Number = L(dr, "JOFRT_SVOH_Number"),
                    JOFRT_SVOH_ServiceOrderNo = S(dr, "JOFRT_SVOH_ServiceOrderNo"),
                    JOFRT_SVOH_ServiceOrderDate = Dt(dr, "JOFRT_SVOH_ServiceOrderDate"),
                    JOFRT_SVOH_Category = S(dr, "JOFRT_SVOH_Category"),
                    JOFRT_SVOH_JW_Vendor_Number = L(dr, "JOFRT_SVOH_JW_Vendor_Number"),
                    JWV_JVG_Number = L(dr, "JWV_JVG_Number"),
                    JVG_JW_VendorGroup = S(dr, "JVG_JW_VendorGroup"),
                    JVC_JW_VendorCategory = S(dr, "JVC_JW_VendorCategory"),
                    JWV_JW_VendorName = S(dr, "JWV_JW_VendorName"),
                    CurrencyCode = S(dr, "CurrencyCode"),
                    JOFRT_SVOI_JPRS_Number = L(dr, "JOFRT_SVOI_JPRS_Number"),
                    JPRS_ProcessName = S(dr, "JPRS_ProcessName"),
                    FromWH = S(dr, "FromWH"),
                    ToWH = S(dr, "ToWH"),
                    UOM = S(dr, "UOM"),
                    Qty = D(dr, "JOFRT_SVOI_Qty"),
                    Rate = D(dr, "JOFRT_SVOI_Rate"),
                    Amount = D(dr, "JOFRT_SVOI_Amount")
                });
            }

            return list;
        }
        #endregion
    }
}
