using System;
using System.Data;
using System.Data.Common;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using ERP_DTO.JobOutwardTransaction;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JOFRT_SVO_DFS_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet JO_FreightServiceOrderDB(FreightServiceOrder_JO_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOFRT_SVO_DFS_Save");

            Db.AddInParameter(DbC, "@JOFRT_SVO_DFS_Category", DbType.String, DTO.JOFRT_SVOH_Category);
            Db.AddInParameter(DbC, "@JOFRT_SVO_DFS_JW_Vendor_Number", DbType.Int64, DTO.JOFRT_SVOH_JW_Vendor_Number);
            Db.AddInParameter(DbC, "@JOFRT_SVO_DFS_PaymentTerms", DbType.String, DTO.JOFRT_SVOH_PaymentTerms);
            Db.AddInParameter(DbC, "@JOFRT_SVO_DFS_DeliveryTerms", DbType.String, DTO.JOFRT_SVOH_DeliveryTerms);
            Db.AddInParameter(DbC, "@JOFRT_SVO_DFS_DeliveryMode", DbType.String, DTO.JOFRT_SVOH_DeliveryMode);
            Db.AddInParameter(DbC, "@JOFRT_SVO_DFS_Tax", DbType.String, DTO.JOFRT_SVOH_Tax);
            Db.AddInParameter(DbC, "@JOFRT_SVO_DFS_TDC", DbType.String, DTO.JOFRT_SVOH_TDC);
            Db.AddInParameter(DbC, "@JOFRT_SVO_DFS_Remarks", DbType.String, DTO.JOFRT_SVOH_Remarks);

            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DataSet DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));
            return DS;
        }

        public DataSet JO_FreightServiceOrderGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOFRT_SVO_DFS_Get");
            return Db.ExecuteDataSet(DbC);
        }
    }
}
