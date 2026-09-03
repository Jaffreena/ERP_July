using System;
using System.Data;
using System.Data.Common;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using ERP_DTO.JobInwardTransaction;

namespace ERP_DAO.JobInwardTransaction
{

    public class JIRN_DFS_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_ReceiptNoteDB(ReceiptNote_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIRN_DFS_Save");

            // Input Parameters
            Db.AddInParameter(DbC, "@JIRN_DFS_JW_CustomerDC_No", DbType.String, DTO.JIRNH_JW_CustomerDC_No);
            Db.AddInParameter(DbC, "@JIRN_DFS_MS_Number", DbType.Int64, DTO.JIRNH_MS_Number);
            Db.AddInParameter(DbC, "@JIRN_DFS_JWC_Number", DbType.Int64, DTO.JIRNH_JWC_Number);
            Db.AddInParameter(DbC, "@JIRN_DFS_Currency_Number", DbType.Int64, DTO.JIRNH_Currency_Number);
            Db.AddInParameter(DbC, "@JIRN_DFS_WH_Number", DbType.Int64, DTO.JIRNH_WH_Number);
            Db.AddInParameter(DbC, "@JIRN_DFS_Remarks", DbType.String, DTO.JIRNH_Remarks);

            // Output Parameters
            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DS = Db.ExecuteDataSet(DbC);

            // Optional: Read output parameters
            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));

            return DS;
        }

        public DataSet JI_ReceiptNoteGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIRN_DFS_Get");

            return Db.ExecuteDataSet(DbC);
        }

    }

    public class JIDN_DFS_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_DeliveryNoteDB(DeliveryNote_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIDN_DFS_Save");

            // Input Parameters
            Db.AddInParameter(DbC, "@JIDN_DFS_MS_Number", DbType.Int64, DTO.JIDNH_MS_Number);
            Db.AddInParameter(DbC, "@JIDN_DFS_JW_Customer_Number", DbType.Int64, DTO.JIDNH_JW_Customer_Number);
            Db.AddInParameter(DbC, "@JIDN_DFS_Currency_Number", DbType.Int64, DTO.JIDNH_Currency_Number);
            Db.AddInParameter(DbC, "@JIDN_DFS_WH_Number", DbType.Int64, DTO.JIDNH_WH_Number);
            Db.AddInParameter(DbC, "@JIDN_DFS_PaymentTerms", DbType.String, DTO.JIDNH_PaymentTerms);
            Db.AddInParameter(DbC, "@JIDN_DFS_DeliveryTerms", DbType.String, DTO.JIDNH_DeliveryTerms);
            Db.AddInParameter(DbC, "@JIDN_DFS_DeliveryMode", DbType.String, DTO.JIDNH_DeliveryMode);
            Db.AddInParameter(DbC, "@JIDN_DFS_DespatchDocument", DbType.String, DTO.JIDNH_DespatchDocument);
            Db.AddInParameter(DbC, "@JIDN_DFS_DespatchedThrough", DbType.String, DTO.JIDNH_DespatchedThrough);
            Db.AddInParameter(DbC, "@JIDN_DFS_Remarks", DbType.String, DTO.JIDNH_Remarks);

            // Output Parameters
            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));

            return DS;
        }

        public DataSet JI_DeliveryNoteGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIDN_DFS_Get");

            return Db.ExecuteDataSet(DbC);
        }
    }

    



    public class DFS_JI_ServiceOrderDAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_ServiceOrderDB(ServiceOrder_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_DFS_JI_ServiceOrder_Save");

            // Input Parameters
            Db.AddInParameter(DbC, "@DFS_JISVOH_ServiceOrderNo", DbType.String, DTO.JISVOH_ServiceOrderNo);
            Db.AddInParameter(DbC, "@DFS_JISVOH_JW_Customer_Number", DbType.Int64, DTO.JISVOH_JW_Customer_Number);
            Db.AddInParameter(DbC, "@DFS_JISVOH_MS_Number", DbType.Int64, DTO.JISVOH_MS_Number);
            Db.AddInParameter(DbC, "@DFS_JISVOH_Currency_Number", DbType.Int64, DTO.JISVOH_Currency_Number);
            Db.AddInParameter(DbC, "@DFS_JISVOH_PaymentTerms", DbType.String, DTO.JISVOH_PaymentTerms);
            Db.AddInParameter(DbC, "@DFS_JISVOH_DeliveryTerms", DbType.String, DTO.JISVOH_DeliveryTerms);
            Db.AddInParameter(DbC, "@DFS_JISVOH_DeliveryMode", DbType.String, DTO.JISVOH_DeliveryMode);
            Db.AddInParameter(DbC, "@DFS_JISVOH_Tax", DbType.String, DTO.JISVOH_Tax);
            Db.AddInParameter(DbC, "@DFS_JISVOH_TDC", DbType.String, DTO.JISVOH_TDC);
            Db.AddInParameter(DbC, "@DFS_JISVOH_Remarks", DbType.String, DTO.JISVOH_Remarks);

            // Output Parameters
            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));

            return DS;
        }

        public DataSet JI_ServiceOrderGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_DFS_JI_ServiceOrder_Get");

            return Db.ExecuteDataSet(DbC);
        }
    }

    public class DFS_JI_JobworkInvoiceDAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_JobworkInvoiceDB(JobworkInvoice_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_DFS_JI_JobworkInvoice_Save");

            // Input Parameters
            Db.AddInParameter(DbC, "@DFS_JISVIH_JW_Customer_Number", DbType.Int64, DTO.JISVIH_JW_Customer_Number);
            Db.AddInParameter(DbC, "@DFS_JISVIH_MS_Number", DbType.Int64, DTO.JISVIH_MS_Number);

            Db.AddInParameter(DbC, "@DFS_JISVIH_Currency_Number", DbType.Int64, DTO.JISVIH_Currency_Number);
            Db.AddInParameter(DbC, "@DFS_JISVIH_TCT_Number", DbType.Int64, DTO.JISVIH_TCT_Number);
            Db.AddInParameter(DbC, "@DFS_JISVIH_PaymentTerms", DbType.String, DTO.JISVIH_PaymentTerms);
            Db.AddInParameter(DbC, "@DFS_JISVIH_PaymentMethod", DbType.String, DTO.JISVIH_PaymentMethod);
            Db.AddInParameter(DbC, "@DFS_JISVIH_Remarks", DbType.String, DTO.JISVIH_Remarks);

            // Output Parameters
            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));

            return DS;
        }

        public DataSet JI_JobworkInvoiceGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_DFS_JI_JobworkInvoice_Get");

            return Db.ExecuteDataSet(DbC);
        }
    }
    public class DFS_JI_ConversionDAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_ConversionDB(Conversion_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_DFS_JI_Conversion_Save");

            // Input Parameters
            Db.AddInParameter(DbC, "@DFS_JICNVH_SFT_Number", DbType.Int64, DTO.JICNVH_SFT_Number);
            Db.AddInParameter(DbC, "@DFS_JICNVH_WC_Number", DbType.Int64, DTO.JICNVH_WC_Number);
            Db.AddInParameter(DbC, "@DFS_JICNVH_Operator", DbType.Int64, DTO.JICNVH_Operator);
            Db.AddInParameter(DbC, "@DFS_JICNVH_PRS_Number", DbType.Int64, DTO.JICNVH_PRS_Number);
            Db.AddInParameter(DbC, "@DFS_JICNVH_MS_Number", DbType.Int64, DTO.JICNVH_MS_Number);
            // Output Parameters
            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));

            return DS;
        }

        public DataSet JI_ConversionGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_DFS_JI_Conversion_Get");

            return Db.ExecuteDataSet(DbC);
        }
    }

    public class JIFRT_SVO_DFS_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_FreightServiceOrderDB(FreightServiceOrder_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIFRT_SVO_DFS_Save");

            // Input Parameters
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_ServiceOrderNo", DbType.String, DTO.JIFRT_SVOH_ServiceOrderNo);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_JW_Customer_Number", DbType.Int64, DTO.JIFRT_SVOH_JW_Customer_Number);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_Currency_Number", DbType.Int64, DTO.JIFRT_SVOH_Currency_Number);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_PaymentTerms", DbType.String, DTO.JIFRT_SVOH_PaymentTerms);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_DeliveryTerms", DbType.String, DTO.JIFRT_SVOH_DeliveryTerms);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_DeliveryMode", DbType.String, DTO.JIFRT_SVOH_DeliveryMode);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_Tax", DbType.String, DTO.JIFRT_SVOH_Tax);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_TDC", DbType.String, DTO.JIFRT_SVOH_TDC);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_Remarks", DbType.String, DTO.JIFRT_SVOH_Remarks);
            Db.AddInParameter(DbC, "@JIFRT_SVOH_DFS_MS_Number", DbType.Int64, DTO.JIFRT_SVOH_MS_Number);

            // Output Parameters
            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));

            return DS;
        }

        public DataSet JI_FreightServiceOrderGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIFRT_SVO_DFS_Get");

            return Db.ExecuteDataSet(DbC);
        }
    }
    public class JIJWI_SVO_DFS_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_JobworkInvoiceServiceOrderDB(JobworkInvoiceServiceOrder_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIJWI_SVO_DFS_Save");

            // Input Parameters
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_ServiceOrderNo", DbType.String, DTO.JIJWI_SVOH_ServiceOrderNo);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_JW_Customer_Number", DbType.Int64, DTO.JIJWI_SVOH_JW_Customer_Number);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_Currency_Number", DbType.Int64, DTO.JIJWI_SVOH_Currency_Number);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_PaymentTerms", DbType.String, DTO.JIJWI_SVOH_PaymentTerms);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_DeliveryTerms", DbType.String, DTO.JIJWI_SVOH_DeliveryTerms);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_DeliveryMode", DbType.String, DTO.JIJWI_SVOH_DeliveryMode);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_Tax", DbType.String, DTO.JIJWI_SVOH_Tax);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_TDC", DbType.String, DTO.JIJWI_SVOH_TDC);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_Remarks", DbType.String, DTO.JIJWI_SVOH_Remarks);
            Db.AddInParameter(DbC, "@JIJWI_SVOH_DFS_MS_Number", DbType.Int64, DTO.JIJWI_SVOH_MS_Number);

            // Output Parameters
            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));

            return DS;
        }

        public DataSet JI_JobworkInvoiceServiceOrderGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIJWI_SVO_DFS_Get");

            return Db.ExecuteDataSet(DbC);
        }
    }
 

}