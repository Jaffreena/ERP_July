using System;
using System.Data;
using System.Data.Common;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using ERP_DTO.JobOutwardTransaction;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JOJWI_SVO_DFS_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet JO_JobworkInvoiceServiceOrderDB(JobworkInvoiceServiceOrder_JO_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOJWI_SVO_DFS_Save");

            Db.AddInParameter(DbC, "@JOJWI_SVO_DFS_MS_Number", DbType.Int64, DTO.JOJWI_SVOH_MS_Number);
            Db.AddInParameter(DbC, "@JOJWI_SVO_DFS_JW_Vendor_Number", DbType.Int64, DTO.JOJWI_SVOH_JW_Vendor_Number);
            Db.AddInParameter(DbC, "@JOJWI_SVO_DFS_PaymentTerms", DbType.String, DTO.JOJWI_SVOH_PaymentTerms);
            Db.AddInParameter(DbC, "@JOJWI_SVO_DFS_DeliveryTerms", DbType.String, DTO.JOJWI_SVOH_DeliveryTerms);
            Db.AddInParameter(DbC, "@JOJWI_SVO_DFS_DeliveryMode", DbType.String, DTO.JOJWI_SVOH_DeliveryMode);
            Db.AddInParameter(DbC, "@JOJWI_SVO_DFS_Tax", DbType.String, DTO.JOJWI_SVOH_Tax);
            Db.AddInParameter(DbC, "@JOJWI_SVO_DFS_TDC", DbType.String, DTO.JOJWI_SVOH_TDC);
            Db.AddInParameter(DbC, "@JOJWI_SVO_DFS_Remarks", DbType.String, DTO.JOJWI_SVOH_Remarks);

            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DataSet DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));
            return DS;
        }

        public DataSet JO_JobworkInvoiceServiceOrderGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOJWI_SVO_DFS_Get");
            return Db.ExecuteDataSet(DbC);
        }
    }
}