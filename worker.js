const config={
    proxy:{
        basePath: "", //proxy endpoint example: http://your-proxy.com/{basePath}/{targetURL}
    },
    cors:{
        allowOrigin: "*",
        allowMethods: "GET",
        allowHeaders: "*"
    }
};
const corsHeaders={
    "Access-Control-Origin":config.cors.allowOrigin,
    "Access-Control-Method":config.cors.allowMethods,
    "Access-Control-Headers":config.cors.allowHeaders
}

export default {
    async fetch(req){
        const url=new URL(req.url);
        if(!url.pathname.startsWith(config.proxy.basePath))return errorResponse("Not Found.", 404);


        if(req.method==="OPTIONS")return new Response(null,
            {
                status: 204,
                headers: corsHeaders()
            }
        );

        const targetUrlRaw=url.pathname.replace(config.proxy.basePath,"");
        let targetUrl="";
        try{
            targetUrl=new URL(targetUrlRaw);
        }catch(e){
            return errorResponse("Invalid URL",400);
        }

        const proxyReq=new Request(targetUrl.toString(),{
            method:req.method,
            headers:req.headers,
            body:req.method==="GET"?null:req.body,
            redirect:"follow"
        });

        try{
            const res=await fetch(proxyReq);
            const headers=new Headers(res.headers);
            setCorsHeaders(headers);

            return new Response(res.body,{
                headers,
            })
        }catch(e){
            return errorResponse("Proxy fetch faild", 582);
            
        }
    }
}

function setCorsHeaders(header){
    header.set("Access-Control-Origin",config.cors.allowOrigin);
    header.set("Access-Control-Method",config.cors.allowMethods);
    header.set("Access-Control-Headers",config.cors.allowHeaders);
}

function errorResponse(message,status){
    return new Response(message,{
        status,
        headers:corsHeaders()
    })
};
